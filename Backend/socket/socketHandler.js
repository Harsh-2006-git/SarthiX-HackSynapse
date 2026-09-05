import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import LocationLog from '../models/LocationLog.js';
import GuardianMapping from '../models/GuardianMapping.js';
import SOSAlert from '../models/SOSAlert.js';
import Client from '../models/client.js';
import { sendSOSEmail } from '../utils/emailService.js';

const userSocketMap = new Map(); // userId -> socketId
let socketServer;

export const notifyZoneRisk = (recipientIds, payload) => {
    if (!socketServer) return;
    recipientIds.filter(Boolean).forEach((recipientId) => {
        socketServer.to(`user_${recipientId}`).emit('ZONE_RISK_ALERT', payload);
    });
};

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust this in production
            methods: ["GET", "POST"]
        }
    });
    socketServer = io;

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error: Invalid token'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        const userId = socket.user.client_id;
        console.log(`User connected: ${userId} (Socket: ${socket.id})`);
        
        userSocketMap.set(userId, socket.id);

        // Join a private room for the user
        socket.join(`user_${userId}`);

        // Handle Live Location Update
        socket.on('sendLocation', async (data) => {
            const { lat, lng, speed, accuracy, tripStats } = data;
            if (!lat || !lng) return;

            try {
                // 1. Find all approved guardians FIRST
                const mappings = await GuardianMapping.findAll({
                    where: { user_id: userId, is_approved: true },
                    attributes: ['guardian_id']
                });

                // 2. IMMEDIATELY broadcast to each guardian (zero delay)
                const payload = { userId, lat, lng, speed, accuracy, tripStats, timestamp: new Date() };
                mappings.forEach(mapping => {
                    io.to(`user_${mapping.guardian_id}`).emit('receiveLocation', payload);
                });

                // 3. Save to DB async (non-blocking — don't make guardian wait for this)
                LocationLog.create({ user_id: userId, lat, lng }).catch(e => 
                    console.error('Location log save error:', e.message)
                );

            } catch (error) {
                console.error('Error processing location update:', error);
            }
        });

        // Handle SOS Alert
        socket.on('sosAlert', async (data) => {
            const { lat, lng } = data;
            
            try {
                // 1. Save SOS to DB
                const sos = await SOSAlert.create({
                    client_id: userId,
                    lat,
                    lng,
                    status: 'active'
                });

                // 2. Get User Info
                const user = await Client.findByPk(userId);

                // 3. Notify Guardians
                const mappings = await GuardianMapping.findAll({
                    where: { user_id: userId, is_approved: true },
                    attributes: ['guardian_id']
                });

                const alertData = {
                    sosId: sos.sos_id,
                    userId,
                    userName: user.name,
                    lat,
                    lng,
                    timestamp: new Date()
                };

                mappings.forEach(mapping => {
                    io.to(`user_${mapping.guardian_id}`).emit('SOS_RECEIVED', alertData);
                });

                // 4. Notify Admins (broadcast to an 'admins' room or just broadcast)
                io.emit('SOS_ADMIN_ALERT', alertData);

                // 5. Send Email Alert in background (non-blocking)
                const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
                if (adminEmail) {
                    sendSOSEmail(adminEmail, {
                        user,
                        location: { lat, lng },
                        nearbyServices: [] // Optional: fetch nearby services later if needed
                    }).catch(emailErr => console.error('SOS Email failed:', emailErr.message));
                }

                console.log(`SOS Alert triggered by user ${userId}`);
            } catch (error) {
                console.error('Error processing SOS alert:', error);
            }
        });

        // Handle Tracking Session Start
        socket.on('startTracking', async (data) => {
            const { guardianId, src, dest } = data;
            if (!guardianId) return;

            try {
                // Get Current User Info
                const user = await Client.findByPk(userId);

                const alertData = {
                    userId,
                    userName: user.name,
                    phone: user.phone,
                    email: user.email,
                    src,
                    dest,
                    timestamp: new Date()
                };

                // Notify the specific guardian
                io.to(`user_${guardianId}`).emit('TRACKING_STARTED', alertData);
                console.log(`Tracking session started for user ${userId} with guardian ${guardianId}`);
            } catch (error) {
                console.error('Error starting tracking session:', error);
            }
        });

        // Handle Tracking Session Stop
        socket.on('stopTracking', async (data) => {
            const { guardianId } = data;
            if (!guardianId) return;

            io.to(`user_${guardianId}`).emit('TRACKING_STOPPED', { userId });
            console.log(`Tracking session stopped for user ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
            userSocketMap.delete(userId);
        });
    });

    return io;
};
