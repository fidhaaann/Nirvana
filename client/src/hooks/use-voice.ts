import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, type ProcessVoiceRequest } from "@shared/routes";
import { nanoid } from "nanoid";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

export function useVoiceInterface() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'system', text: string}[]>([]);
  const sessionId = useRef(sessionStorage.getItem("voice_session_id") || nanoid());
  
  // Speech Recognition Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Initialize Session
  useEffect(() => {
    sessionStorage.setItem("voice_session_id", sessionId.current);
    
    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setState("listening");
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        // If we stopped listening but haven't processed yet (and have content), process it
        // We handle explicit processing triggering elsewhere to avoid race conditions
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setState("idle");
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const processMutation = useMutation({
    mutationFn: async (text: string) => {
      const payload: ProcessVoiceRequest = {
        text,
        sessionId: sessionId.current
      };
      const res = await fetch(api.voice.process.path, {
        method: api.voice.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to process voice");
      return api.voice.process.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'system', text: data.textResponse }]);
      speak(data.textResponse);
    },
    onError: () => {
      setState("idle");
      const errorMsg = "I'm sorry, I had trouble processing that. Please try again.";
      setMessages(prev => [...prev, { role: 'system', text: errorMsg }]);
      speak(errorMsg);
    }
  });

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (transcript.trim()) {
        setState("processing");
        setMessages(prev => [...prev, { role: 'user', text: transcript }]);
        processMutation.mutate(transcript);
      } else {
        setState("idle");
      }
    }
  }, [transcript, processMutation]);

  const speak = useCallback((text: string) => {
    setState("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to pick a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setState("idle");
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const resetConversation = () => {
    setMessages([]);
    setTranscript("");
    window.speechSynthesis.cancel();
    setState("idle");
    sessionId.current = nanoid();
    sessionStorage.setItem("voice_session_id", sessionId.current);
  };

  return {
    state,
    transcript,
    messages,
    startListening,
    stopListening,
    resetConversation
  };
}
