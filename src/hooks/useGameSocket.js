import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';

/**
 * useGameSocket — manages a STOMP connection for a given room.
 *
 * roomData     → last raw room update (GameRoom object)
 * gameEvent    → last typed event {type, payload} broadcast by BattleService
 * connected    → boolean
 * sendMessage  → publish to /app<destination>
 */
export const useGameSocket = (roomId) => {
  const { token } = useAuth();
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [gameEvent, setGameEvent] = useState(null); // { type, payload }
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !roomId) return;

    const client = new Client({
      // Must be absolute URL so the WS can reach backend from the Vite dev server
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const data = JSON.parse(message.body);

            // Typed BattleService events carry a `type` field
            if (data && data.type) {
              setGameEvent(data);
            } else {
              // Raw GameRoom object from GameService
              setRoomData(data);
            }
          } catch (e) {
            console.error('WS parse error', e);
          }
        });

        // Tell server we joined
        client.publish({
          destination: `/app/room/${roomId}/join`,
          headers: { Authorization: `Bearer ${token}` },
          body: '',
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        setError(frame.headers['message']);
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        try {
          client.publish({
            destination: `/app/room/${roomId}/leave`,
            headers: { Authorization: `Bearer ${token}` },
            body: '',
          });
        } catch (_) {}
        client.deactivate();
      }
    };
  }, [roomId, token]);

  const sendMessage = useCallback(
    (destination, body) => {
      const client = clientRef.current;
      if (client && client.active) {
        client.publish({
          destination: `/app${destination}`,
          body: JSON.stringify(body),
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    },
    [token]
  );

  return { connected, roomData, gameEvent, error, sendMessage };
};
