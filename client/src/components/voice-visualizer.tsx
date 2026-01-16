import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  state: "idle" | "listening" | "processing" | "speaking";
}

export function VoiceVisualizer({ state }: VoiceVisualizerProps) {
  return (
    <div className="h-24 w-full flex items-center justify-center gap-1.5">
      {state === "idle" && (
        <div className="text-muted-foreground text-sm font-medium">
          Ready to listen...
        </div>
      )}

      {state === "listening" && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-red-500 rounded-full"
              animate={{
                height: [16, 48, 16],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      {state === "processing" && (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Processing</span>
        </div>
      )}

      {state === "speaking" && (
        <>
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-blue-500 rounded-full"
              animate={{
                height: [12, 64, 12],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
