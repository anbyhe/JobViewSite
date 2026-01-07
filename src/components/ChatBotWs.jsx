import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import InterruptActionCard from "./InterruptActionCard";
const ChatBotWs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeInterrupt, setActiveInterrupt] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Offline");
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const sessionId = useRef(uuid());
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const prepareMessage = (message, type) =>{
    return {
      id: Date.now(),
      text: message,
      sender: type,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const handleDecision = (interruptId, thread_id, isApproved) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open.");
        return;
    }

    const action = isApproved ? "approve" : "reject";
    const resumePayload = {
      type: 'resume', 
      interrupt_id: interruptId,
      thread_id: thread_id,
      value: { decisions: [{ type: action }] }
    };

    wsRef.current.send(JSON.stringify(resumePayload));

    const decisionText = isApproved ? "Action Approved. Resuming agent..." : "Action Rejected. Agent will reconsider.";
    const userDecisionMessage = prepareMessage(decisionText, "user");
    setMessages((prev) => [...prev, userDecisionMessage]);
    
    setActiveInterrupt(null); 
    setIsLoading(true); 
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://localhost:8000/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("Online");
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          console.log("Received message:", msg);

          if (msg.type === "connected") {
            console.log("WebSocket connected");
          } else if (msg.type === "message") {
            setIsLoading(false);
            const aiMessage = prepareMessage(msg.content, "ai");
            setMessages((prev) => [...prev, aiMessage]);
          } else if (msg.type === "interrupt") {
            setIsLoading(false);
            const t = msg.requests[0].description;
            const interruptMessage = prepareMessage(t, "ai");
            setMessages((prev) => [...prev, interruptMessage]);
            setActiveInterrupt(msg);
          } else if (msg.type === "error") {
            const aiMessage = prepareMessage(msg.content, "ai");
            setMessages((prev) => [...prev, aiMessage]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
          const aiMessage = prepareMessage(ev.data, "ai");
          setMessages((prev) => [...prev, aiMessage]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("Offline");
        //setMessages((prev) => [...prev, "Disconnected from server"]);

        // Attempt reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        setConnectionStatus("error");
      };
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = prepareMessage(inputText, "user");
    // 添加用户消息
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const startmessage = {
          type: "start",
          thread_id: sessionId.current,
          query: inputText,
        };
        //"Schedule a meeting with the design team(design_team@ci.com) next Tuesday at 2pm for 1 hour, and send them an email reminder about reviewing the new mockups."
        wsRef.current.send(JSON.stringify(startmessage));
      } else {
        const aiMessage = prepareMessage("Sorry, unable to connect to the server.", "ai");
        setMessages((prev) => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error("API调用失败:", error);
      const errorMessage = prepareMessage(
        "An error occurred while processing your request. Please try again later.",
        "ai"
      );
      setMessages((prev) => [...prev, errorMessage]);
    } 
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 清空聊天记录
  const clearChat = () => {
    setMessages([]);
    setActiveInterrupt(null); 
  };

  const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  audioChunks.current = [];
  mediaRecorderRef.current = mediaRecorder;

  mediaRecorder.ondataavailable = (e) => audioChunks.current.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const payload = {
      type: "voice",
      thread_id: sessionId.current,
      audio: base64
    };

    wsRef.current.send(JSON.stringify(payload));
    setIsLoading(true);
  };

  mediaRecorder.start();
  setRecording(true);
};

const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    // 停止所有媒体轨道以释放麦克风
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  }
  setRecording(false);
};

  return (
    <>
      {/* 固定图标 */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors cursor-pointer relative"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {/* 未读消息小红点 */}
          {messages.length > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-1/3 h-96 bg-white rounded-lg shadow-2xl z-50 border flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Agent Chat</h3>
                  <p className="text-blue-100 text-xs">{connectionStatus}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={clearChat}
                  className="text-white hover:text-blue-200 text-sm"
                  title="清空聊天"
                >
                  🗑️
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-blue-200"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm">Can I help you？</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                        {activeInterrupt && messages[messages.length - 1].id === message.id && (
                            <InterruptActionCard 
                                interruptData={activeInterrupt} 
                                onDecision={handleDecision}
                            />
                        )}
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Input your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  recording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title={recording ? 'Stop recording' : 'Start voice recording'}
              >
                {recording ? (
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading || recording}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWs;
