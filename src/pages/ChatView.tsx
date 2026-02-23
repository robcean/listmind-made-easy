import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useStore } from "@/store/useStore";
import { sendMessage, uploadFile, fetchCategories, fetchArchivedCategories, fetchItems, fetchChatHistory } from "@/services/api";
import { t } from "@/i18n";
import { Send, Mic, Paperclip, X, FileText } from "lucide-react";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
function isImageFile(file: File): boolean {
  return IMAGE_TYPES.has(file.type);
}
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const ChatView = () => {
  const messages = useStore((s) => s.messages);
  const setMessages = useStore((s) => s.setMessages);
  const addMessage = useStore((s) => s.addMessage);
  const addCategory = useStore((s) => s.addCategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const addItem = useStore((s) => s.addItem);
  const setCategories = useStore((s) => s.setCategories);
  const setArchivedCategories = useStore((s) => s.setArchivedCategories);
  const activeTab = useStore((s) => s.activeTab);
  const setItems = useStore((s) => s.setItems);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string; isImage: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Load chat history from database on mount
  useEffect(() => {
    let cancelled = false;
    fetchChatHistory()
      .then((history) => {
        if (cancelled) return;
        if (history.length > 0) {
          setMessages(history);
        } else {
          // No history — show welcome message
          setMessages([{
            id: "msg_welcome",
            role: "assistant",
            text: "Hey! I'm your meSync assistant. Tell me what you need — add items, create lists, set reminders, or send me a photo and I'll help you with it.",
            actions: [],
            timestamp: new Date().toISOString(),
          }]);
        }
      })
      .catch(() => {
        // Offline or error — show welcome if no messages
        if (!cancelled && messages.length === 0) {
          setMessages([{
            id: "msg_welcome",
            role: "assistant",
            text: "Hey! I'm your meSync assistant. Tell me what you need — add items, create lists, set reminders, or send me a photo and I'll help you with it.",
            actions: [],
            timestamp: new Date().toISOString(),
          }]);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (pendingFile?.isImage) URL.revokeObjectURL(pendingFile.preview);
    };
  }, [pendingFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Clean up previous preview
    if (pendingFile?.isImage) URL.revokeObjectURL(pendingFile.preview);
    const isImg = isImageFile(file);
    setPendingFile({
      file,
      preview: isImg ? URL.createObjectURL(file) : file.name,
      isImage: isImg,
    });
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const clearPendingFile = () => {
    if (pendingFile) {
      if (pendingFile.isImage) URL.revokeObjectURL(pendingFile.preview);
      setPendingFile(null);
    }
  };

  const handleSend = async (text: string) => {
    const hasText = text.trim().length > 0;
    const hasFile = !!pendingFile;
    if (!hasText && !hasFile) return;

    let imageUrl: string | undefined;

    // Upload file first if present
    if (pendingFile) {
      setIsUploading(true);
      try {
        const result = await uploadFile(pendingFile.file);
        imageUrl = result.url;
      } catch {
        setIsUploading(false);
        addMessage({
          id: `msg_err_${Date.now()}`,
          role: "assistant",
          text: "Sorry, I couldn't upload that file. Please try again.",
          actions: [],
          timestamp: new Date().toISOString(),
        });
        return;
      }
      setIsUploading(false);
    }

    const defaultText = pendingFile?.isImage
      ? "What's in this image?"
      : `Process this file: ${pendingFile?.file.name}`;

    const userText = hasText ? text.trim() : defaultText;

    // Show optimistic user message immediately
    const tempUserMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      text: userText,
      imageUrl,
      actions: [],
      timestamp: new Date().toISOString(),
    };
    addMessage(tempUserMsg);
    setInput("");
    clearPendingFile();
    setIsThinking(true);

    try {
      const { userMessage, message: response } = await sendMessage(userText, imageUrl);
      setIsThinking(false);

      // Replace optimistic user message with server-persisted one
      setMessages([
        ...messages.filter((m) => m.id !== tempUserMsg.id),
        { ...userMessage, imageUrl },
        response,
      ]);

      // Apply actions to store
      for (const action of response.actions) {
        if (action.type === "category_created" && action.category) {
          addCategory(action.category);
        }
        if ((action.type === "category_deleted" || action.type === "category_archived") && action.category) {
          removeCategory(action.category.id);
        }
        if (action.type === "item_created" && action.item) {
          addItem(action.item);
        }
      }

      // Refresh categories and items after any action
      if (response.actions.length > 0) {
        try {
          const cats = await fetchCategories();
          setCategories(cats);
          // Refresh archived list if archive/restore actions occurred
          const hasArchiveAction = response.actions.some(
            (a) => a.type === "category_archived" || a.type === "category_restored"
          );
          if (hasArchiveAction) {
            const archived = await fetchArchivedCategories();
            setArchivedCategories(archived);
          }
          const deletedOrArchivedIds = response.actions
            .filter((a) => (a.type === "category_deleted" || a.type === "category_archived") && a.category)
            .map((a) => a.category!.id);
          if (activeTab && !deletedOrArchivedIds.includes(activeTab)) {
            const its = await fetchItems(activeTab);
            setItems(its);
          }
        } catch {
          // Refresh failed — not critical
        }
      }
    } catch (err) {
      setIsThinking(false);
      addMessage({
        id: `msg_err_${Date.now()}`,
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
        actions: [],
        timestamp: new Date().toISOString(),
      });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-full page-transition">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex msg-enter",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className="max-w-[80%] space-y-1">
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-chat-assistant text-foreground rounded-bl-md"
                )}
              >
                {msg.imageUrl && msg.role === "user" && (
                  /\.(txt|md|csv|json)$/i.test(msg.imageUrl) ? (
                    <div className="flex items-center gap-2 mb-2 bg-black/20 rounded-lg px-3 py-2">
                      <FileText className="h-5 w-5 shrink-0" />
                      <span className="text-xs truncate">{msg.imageUrl.split("/").pop()}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="block mb-2"
                      onClick={() => setFullscreenImage(msg.imageUrl!)}
                    >
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded"
                        className="rounded-lg max-h-48 max-w-full object-cover"
                      />
                    </button>
                  )
                )}
                {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>p+p]:mt-1.5 [&>ul]:pl-4 [&>ol]:pl-4">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
                ) : (
                  msg.text
                )}
              </div>
              {msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {msg.actions.map((a, i) => (
                    <span
                      key={i}
                      className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full"
                    >
                      {a.summary}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-chat-assistant rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File preview bar */}
      {pendingFile && (
        <div className="px-4 py-2 border-t border-border bg-card flex items-center gap-2">
          <div className="relative">
            {pendingFile.isImage ? (
              <img
                src={pendingFile.preview}
                alt="Preview"
                className="h-16 w-16 object-cover rounded-lg"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={clearPendingFile}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {pendingFile.file.name}
          </span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Input bar */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card safe-bottom">
        <button type="button" className="text-muted-foreground p-2">
          <Mic className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isThinking}
          className="text-muted-foreground p-2 disabled:opacity-30 transition-opacity"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat.placeholder")}
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="submit"
          disabled={(!input.trim() && !pendingFile) || isThinking || isUploading}
          className="text-primary p-2 disabled:opacity-30 transition-opacity"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {/* Fullscreen image overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatView;
