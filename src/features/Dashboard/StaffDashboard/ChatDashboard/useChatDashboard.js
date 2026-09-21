import { useState, useEffect, useCallback, useRef } from 'react';
import chatWebSocketService from './websocketService';
import chatAPIService from '../../../Chat/chatApi';

/**
 * Custom Hook for Chat Dashboard
 * Quản lý WebSocket connection và chat functionality cho Staff
 */
const useChatDashboard = (staffName) => {
  // States
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // Refs
  const subscriptionsRef = useRef(new Set());
  const connectWebSocketRef = useRef(null);
  const disconnectWebSocketRef = useRef(null);
  const loadSessionsRef = useRef(null);
  const loadStatsRef = useRef(null);
  const handleNewMessageRef = useRef(null);
  const handleNewSessionRef = useRef(null);

  /**
   * Initialize WebSocket connection
   */
  const connectWebSocket = useCallback(async () => {
    if (connected || connecting) return;

    setConnecting(true);
    setError(null);

    try {
      await chatWebSocketService.connect();
      setConnected(true);
      
      // Subscribe to staff messages
      const staffSubscription = chatWebSocketService.subscribeToStaffMessages((message) => {
        console.log('Staff message received:', message);
        handleNewMessageRef.current?.(message);
      });

      // Subscribe to new session notifications
      const newSessionSubscription = chatWebSocketService.subscribeToNewSessions((notification) => {
        console.log('New session notification:', notification);
        handleNewSessionRef.current?.(notification);
      });

      if (staffSubscription) subscriptionsRef.current.add('staff-messages');
      if (newSessionSubscription) subscriptionsRef.current.add('new-sessions');

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setError('Failed to connect to chat service');
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting]);
  connectWebSocketRef.current = connectWebSocket;

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    chatWebSocketService.disconnect();
    setConnected(false);
    subscriptionsRef.current.clear();
  }, []);
  disconnectWebSocketRef.current = disconnectWebSocket;

  /**
   * Load chat sessions
   */
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const sessionsData = await chatAPIService.getChatSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  }, []);
  loadSessionsRef.current = loadSessions;

  /**
   * Join a chat session
   */
  const joinSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      
      // Load session details
      const sessionData = await chatAPIService.getChatSession(sessionId);
      setActiveSession(sessionData);

      // Load session messages
      const messagesData = await chatAPIService.getSessionMessages(sessionId);
      setMessages(messagesData);

      // Subscribe to session messages via WebSocket
      if (connected) {
        const sessionSubscription = chatWebSocketService.subscribeToSession(sessionId, (message) => {
          console.log('Session message received:', message);
          setMessages(prev => [...prev, message]);
        });

        if (sessionSubscription) {
          subscriptionsRef.current.add(`session-${sessionId}`);
        }

        // Send join notification
        chatWebSocketService.joinChatSession(sessionId);
      }

    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join chat session');
    } finally {
      setLoading(false);
    }
  }, [connected]);

  /**
   * Leave current session
   */
  const leaveSession = useCallback(() => {
    if (activeSession) {
      // Unsubscribe from session messages
      chatWebSocketService.unsubscribe(`/topic/chat/${activeSession.sessionId}`);
      subscriptionsRef.current.delete(`session-${activeSession.sessionId}`);
    }
    
    setActiveSession(null);
    setMessages([]);
  }, [activeSession]);

  /**
   * Send message
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!activeSession || !messageText.trim()) return;

    try {
      // Send via WebSocket first
      if (connected) {
        const success = chatWebSocketService.sendChatMessage(
          activeSession.sessionId,
          messageText,
          staffName,
          'STAFF'
        );

        if (success) {
          // Message sent via WebSocket, will be received via subscription
          return;
        }
      }

      // Fallback to REST API
      const message = await chatAPIService.sendMessage(
        activeSession.sessionId,
        messageText,
        staffName,
        'STAFF'
      );

      setMessages(prev => [...prev, message]);

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  }, [activeSession, staffName, connected]);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (sessionId) => {
    try {
      if (connected) {
        chatWebSocketService.markMessagesAsRead(sessionId, staffName);
      }
      
      await chatAPIService.markMessagesAsRead(sessionId, staffName);
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.sessionId === sessionId && msg.senderType !== 'STAFF'
            ? { ...msg, read: true }
            : msg
        )
      );

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [staffName, connected]);

  /**
   * Handle new message from WebSocket
   */
  const handleNewMessage = useCallback((message) => {
    // Update sessions list if needed
    setSessions(prev => 
      prev.map(session => 
        session.sessionId === message.sessionId
          ? { ...session, lastMessage: message, unreadCount: (session.unreadCount || 0) + 1 }
          : session
      )
    );

    // Add to current session messages if it's the active session
    if (activeSession && message.sessionId === activeSession.sessionId) {
      setMessages(prev => [...prev, message]);
    }
  }, [activeSession]);
  handleNewMessageRef.current = handleNewMessage;

  /**
   * Handle new session notification
   */
  const handleNewSession = useCallback(() => {
    // Reload sessions to include new session
    loadSessions();
  }, [loadSessions]);
  handleNewSessionRef.current = handleNewSession;

  /**
   * Load chat statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const statsData = await chatAPIService.getChatStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);
  loadStatsRef.current = loadStats;

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    connectWebSocketRef.current?.();
    loadSessionsRef.current?.();
    loadStatsRef.current?.();

    return () => {
      disconnectWebSocketRef.current?.();
    };
  }, []);

  // Auto-reconnect when connection is lost
  useEffect(() => {
    if (!connected && !connecting) {
      const timer = setTimeout(() => {
        connectWebSocketRef.current?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [connected, connecting]);

  return {
    // Connection state
    connected,
    connecting,
    
    // Data
    sessions,
    activeSession,
    messages,
    stats,
    
    // Loading & Error states
    loading,
    error,
    
    // Actions
    connectWebSocket,
    disconnectWebSocket,
    loadSessions,
    joinSession,
    leaveSession,
    sendMessage,
    markAsRead,
    loadStats,
    clearError,
  };
};

export default useChatDashboard;
