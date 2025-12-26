import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export default function WsPage() {
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [interrupts, setInterrupts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const sessionId = useRef(uuid()); // Use ref to avoid recreating on re-renders

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://localhost:8000/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        setMessages(prev => [...prev, "Connected to server"]);
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          console.log("Received message:", msg);

          if (msg.type === "connected") {
            setMessages(prev => [...prev, `Server: ${msg.message}`]);
          }
          else if (msg.type === "message") {
            setMessages(prev => [...prev, msg.content]);
          }
          else if (msg.type === "interrupt") {
            setInterrupts(prev => [...prev, msg]);
          }
          else if (msg.type === "error") {
            setMessages(prev => [...prev, `Error: ${msg.message}`]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
          setMessages(prev => [...prev, `Raw message: ${ev.data}`]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("disconnected");
        setMessages(prev => [...prev, "Disconnected from server"]);
        
        // Attempt reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
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

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const start = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: "start",
        thread_id: sessionId.current,
        query: query
      };
      //"Schedule a meeting with the design team(design_team@ci.com) next Tuesday at 2pm for 1 hour, and send them an email reminder about reviewing the new mockups."
      wsRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, "Starting agent..."]);
    } else {
      setMessages(prev => [...prev, "WebSocket not connected. Cannot start agent."]);
    }
  };

  const approve = (id) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "resume",
        interrupt_id: id,
        thread_id: sessionId.current,
        value: { decisions: [{ type: "approve" }] }
      }));
      setInterrupts(prev => prev.filter(x => x.interrupt_id !== id));
      setMessages(prev => [...prev, `Approved action: ${id}`]);
    }
  };

  const reject = (id) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "resume",
        interrupt_id: id,
        thread_id: sessionId.current,
        value: { decisions: [{ type: "reject" }] }
      }));
      setInterrupts(prev => prev.filter(x => x.interrupt_id !== id));
      setMessages(prev => [...prev, `Rejected action: ${id}`]);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Interrupt + Resume Demo (LangChain Agents)</h1>
      
      <div style={{ marginBottom: 20 }}>
        <span>Status: </span>
        <span style={{
          color: connectionStatus === "connected" ? "green" : 
                 connectionStatus === "error" ? "red" : "orange",
          fontWeight: "bold"
        }}>
          {connectionStatus.toUpperCase()}
        </span>
      </div>
      <input className="border" value={query} onChange={handleQueryChange}></input>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded" onClick={start} disabled={connectionStatus !== "connected"}>
        Start Agent
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Messages:</h3>
        <pre style={{ 
          background: "#f5f5f5", 
          padding: 10, 
          maxHeight: 400, 
          overflow: "auto",
          border: "1px solid #ddd"
        }}>
          {messages.join("\n")}
        </pre>
      </div>

      {interrupts.map((interrupt) => (
        <div key={interrupt.interrupt_id} style={{ 
          background: "#fff3cd", 
          padding: 15, 
          margin: "10px 0",
          border: "1px solid #ffeaa7",
          borderRadius: 5
        }}>
          <h3>⚠️ Action Requires Approval</h3>
          <pre style={{ background: "white", padding: 10 }}>
            {JSON.stringify(interrupt.requests, null, 2)}
          </pre>
          <div style={{ marginTop: 10 }}>
            <button 
              onClick={() => approve(interrupt.interrupt_id)}
              style={{ marginRight: 10 }}
            >
              Approve
            </button>
            <button onClick={() => reject(interrupt.interrupt_id)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}