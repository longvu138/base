import { useRef, useState, type KeyboardEvent } from 'react';
import { Spin } from 'antd';
import { PaperClipOutlined, SendOutlined, MessageOutlined, FileOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useChatCommentsQuery, useCreateChatCommentMutation, useUploadChatAttachmentMutation } from '@repo/hooks';
import './ChatPanel.css';

interface ChatPanelProps {
    /** Loại entity: 'orders' | 'shipments' | 'peerpayments' | ... */
    entityType: string;
    /** Mã entity: 'BG00W5F', ... */
    entityCode: string;
    /** Style dáng bo: 'square' (Style1) | 'round' (Style3) */
    rounded?: 'square' | 'round';
}

/**
 * ChatPanel — generic comment panel dùng cho mọi entity.
 * Đặt tại components/Common để tái sử dụng cho orders, shipments, peerpayments...
 *
 * API pattern: customer/{entityType}/{entityCode}/comments
 */
export const ChatPanel = ({ entityType, entityCode, rounded = 'square' }: ChatPanelProps) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: comments = [], isLoading } = useChatCommentsQuery(entityType, entityCode);
    const { mutateAsync: send } = useCreateChatCommentMutation(entityType, entityCode);
    const { mutateAsync: upload } = useUploadChatAttachmentMutation(entityType, entityCode);
    const [submitting, setSubmitting] = useState(false);


    const handleSend = async () => {
        const trimmed = text.trim();
        if ((!trimmed && files.length === 0) || submitting) return;

        setSubmitting(true);
        try {
            let finalComment = trimmed;

            // Upload từng file và build mã HTML như code mẫu của bạn
            if (files.length > 0) {
                const uploadPromises = files.map(async ({ file }) => {
                    const res = await upload(file);
                    // Dựa trên response cấu trúc Gobiz (thường có data.location hoặc data.data.location)
                    const data = res.data?.data || res.data || res;
                    const location = data.location || '';
                    const name = data.name || file.name;
                    const mimeType = data.mimeType || file.type;

                    if (mimeType.includes('image/')) {
                        return `<img referrerPolicy="no-referrer" src="${location}" alt="${name}" style="max-width:100%; display:block; margin:8px 0;" />`;
                    } else {
                        return `<a target="_blank" href="${location}" style="display:block; margin:4px 0;"><i class="fa-solid fa-paperclip"></i> ${name}</a>`;
                    }
                });

                const htmlTags = await Promise.all(uploadPromises);
                finalComment = (trimmed ? trimmed + '<br/>' : '') + htmlTags.join('');
            }

            await send({ comment: finalComment });
            setText('');
            setFiles([]);
        } catch (err) {
            console.error('[ChatPanel] handleSend error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            newFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        setFiles(prev => [...prev, { file, preview: ev.target?.result as string }]);
                    };
                    reader.readAsDataURL(file);
                } else {
                    setFiles(prev => [...prev, { file, preview: '' }]);
                }
            });
        }
        // Reset input value so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInitial = (val: any) => {
        const str = val != null ? String(val) : '?';
        return str.charAt(0).toUpperCase() || '?';
    };

    const formatTime = (ts: any) => {
        if (!ts) return '';
        const d = new Date(typeof ts === 'number' ? ts : String(ts));
        if (isNaN(d.getTime())) return String(ts);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const cls = rounded === 'round' ? 'chat-panel chat-panel--round' : 'chat-panel chat-panel--square';

    return (
        <div className={cls}>
            {/* Header */}
            <div className="chat-header">
                <MessageOutlined className="chat-header-icon" />
                <span className="chat-header-title">Ghi chú / Trao đổi</span>
            </div>

            {/* Input area — nằm trên cùng như thiết kế */}
            <div className="chat-input-wrap">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết tin nhắn..."
                    rows={3}
                    className="chat-textarea"
                    disabled={submitting}
                />

                <div className="chat-input-actions">
                    <div className="chat-input-left">
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button
                            className="chat-attach-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={submitting}
                            title="Đính kèm file"
                        >
                            <PaperClipOutlined />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={(!text.trim() && files.length === 0) || submitting}
                        className="chat-send-btn"
                    >
                        {submitting ? <Spin size="small" /> : <SendOutlined />}
                        <span>Gửi</span>
                    </button>
                </div>

                {/* Selected Files List - Grid Layout (Nằm dưới nút bấm như screenshot) */}
                {files.length > 0 && (
                    <div className="chat-attachments-grid">
                        {files.map((f, i) => (
                            <div key={i} className="chat-file-thumb">
                                <div className="chat-thumb-inner">
                                    {f.preview ? (
                                        <img src={f.preview} alt={f.file.name} className="chat-thumb-img" />
                                    ) : (
                                        <div className="chat-thumb-icon-box">
                                            <FileOutlined />
                                        </div>
                                    )}
                                    <div className="chat-thumb-remove" onClick={() => removeFile(i)}>
                                        <CloseCircleFilled />
                                    </div>
                                </div>
                                <span className="chat-thumb-name" title={f.file.name}>
                                    {f.file.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {isLoading ? (
                    <div className="chat-state"><Spin /></div>
                ) : comments.length === 0 ? (
                    <div className="chat-state chat-state--empty">Chưa có tin nhắn nào</div>
                ) : (
                    // Hiện tin nhắn mới nhất lên đầu (New -> Old)
                    comments.map((msg: any, idx: number) => {
                        // Log cấu trúc message trong dev để debug field name
                        if (import.meta.env.DEV && idx === 0) {
                            console.log('[ChatPanel] message sample:', JSON.stringify(msg, null, 2));
                        }

                        // Thử tất cả field phổ biến — gobiz API có thể dùng bất kỳ field nào
                        const name = msg.author?.fullname || msg.author?.fullName || msg.creator?.displayName || msg.creator?.username || 'Hệ thống';
                        const avatar = msg.author?.avatar || msg.creator?.avatar;

                        const isStaff = !!msg.author?.staff;
                        const msgCls = isStaff ? 'chat-msg chat-msg--other' : 'chat-msg chat-msg--mine';

                        const content = String(msg.content ?? msg.message ?? msg.text ?? msg.comment ?? '');
                        const time = msg.timestamp ?? msg.createdAt ?? '';
                        return (
                            <div key={msg.id ?? msg._id ?? idx} className={msgCls}>
                                <div className="chat-avatar">
                                    {avatar
                                        ? <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        : <span>{getInitial(name)}</span>
                                    }
                                </div>
                                <div className="chat-bubble-wrap">
                                    <div className="chat-sender">
                                        <span className="chat-sender-name">{name}</span>
                                        {isStaff && <span className="chat-staff-badge">Staff</span>}
                                        {time && <span className="chat-time">{formatTime(time)}</span>}
                                    </div>
                                    <div className="chat-bubble">
                                        {content}
                                        {/* Render attachments in message */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="chat-msg-attachments">
                                                {msg.attachments.map((att: any, attIdx: number) => {
                                                    const url = att.url ?? att.uri ?? att.link;
                                                    const fileName = att.name ?? att.fileName ?? att.originalName ?? `File ${attIdx + 1}`;
                                                    return (
                                                        <a
                                                            key={att.id ?? attIdx}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="chat-msg-file"
                                                        >
                                                            <FileOutlined />
                                                            <span>{fileName}</span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
