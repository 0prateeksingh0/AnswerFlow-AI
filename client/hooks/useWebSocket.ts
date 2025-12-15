import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);

    // Use a ref to prevent continuous reconnection on re-renders if the url doesn't change
    // but here we just pass url directly.

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                console.error("Ws parse error", e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            // Reconnect logic could go here
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [url]);

    return { socket, lastMessage };
}
