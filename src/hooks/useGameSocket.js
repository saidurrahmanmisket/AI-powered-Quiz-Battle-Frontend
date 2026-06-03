import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';

export const useGameSocket = (roomId) => {
  const { token } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !roomId) return;

    const socket = new SockJS('/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str);
      },
      onConnect: () => {
        setConnected(true);
        // Subscribe to room updates
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          setRoomData(JSON.parse(message.body));
        });

        // Send join message
        client.publish({
          destination: `/app/room/${roomId}/join`,
          headers: { Authorization: `Bearer ${token}` }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setError(frame.headers['message']);
      },
      onDisconnect: () => {
        setConnected(false);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.publish({
          destination: `/app/room/${roomId}/leave`,
          headers: { Authorization: `Bearer ${token}` }
        });
        client.deactivate();
      }
    };
  }, [roomId, token]);

  const sendMessage = useCallback((destination, body) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }, [stompClient, connected, token]);

  return { connected, roomData, error, sendMessage };
};
