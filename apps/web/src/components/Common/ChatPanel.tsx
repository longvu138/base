import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  theme,
} from "antd";
import type { UploadProps } from "antd";
import {
  CloseCircleFilled,
  CrownFilled,
  FileOutlined,
  MessageOutlined,
  PaperClipOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  useChatCommentsQuery,
  useCreateChatCommentWithAttachmentsMutation,
  useCreateChatCommentMutation,
  useUploadChatAttachmentMutation,
  useCustomerProfile,
} from "@repo/hooks";
import { useTheme } from "@repo/theme-provider";
import { useTranslation } from "react-i18next";

interface ChatPanelProps {
  /** Loại entity: 'orders' | 'shipments' | 'peerpayments' | ... */
  entityType: string;
  /** Mã entity: 'BG00W5F', ... */
  entityCode: string;
  /** Style dáng bo: 'square' (Style1) | 'round' (Style3) */
  rounded?: "square" | "round";
  /** Ngày tạo entity để chọn đúng comment API theo tenant config. */
  entityCreatedAt?: string;
}

const { Text } = Typography;
const { TextArea } = Input;

const isImage = (mimeType?: string, url?: string) =>
  String(mimeType || "").includes("image/") ||
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(url || ""));

const isVideo = (mimeType?: string, url?: string) =>
  String(mimeType || "").includes("video/") ||
  /\.(mp4|webm|ogg|mov|m4v)$/i.test(String(url || ""));

const truncateFileName = (name: string, max = 18) =>
  name.length > max ? `${name.slice(0, max - 3)}...` : name;

const linkify = (value: string) =>
  value.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noreferrer">$1</a>',
  );

/**
 * ChatPanel — generic comment panel dùng cho mọi entity.
 * Đặt tại components/Common để tái sử dụng cho orders, shipments, peerpayments...
 *
 * API pattern: customer/{entityType}/{entityCode}/comments
 */
export const ChatPanel = ({
  entityType,
  entityCode,
  rounded = "square",
  entityCreatedAt,
}: ChatPanelProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { tenantConfig } = useTheme();
  const { data: profile } = useCustomerProfile();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [previewMedia, setPreviewMedia] = useState<any>(null);
  const inputKeyRef = useRef(0);

  const taiyiConfig = tenantConfig?.tenantConfig?.taiyiConfig || {};
  const chatMode =
    entityType === "orders" &&
    taiyiConfig.enabled &&
    entityCreatedAt &&
    taiyiConfig.updateToNewCommentTime &&
    new Date(entityCreatedAt).getTime() >
      new Date(taiyiConfig.updateToNewCommentTime).getTime()
      ? "posedon"
      : "legacy";

  const {
    data: commentsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatCommentsQuery(
    entityType,
    entityCode,
    chatMode,
  );
  const comments = useMemo(
    () => commentsData?.pages.flatMap((page: any) => page.data) ?? [],
    [commentsData],
  );
  const { mutateAsync: send } = useCreateChatCommentMutation(
    entityType,
    entityCode,
    chatMode,
  );
  const { mutateAsync: sendWithAttachments } =
    useCreateChatCommentWithAttachmentsMutation(
      entityType,
      entityCode,
      chatMode,
  );
  const { mutateAsync: upload } = useUploadChatAttachmentMutation(
    entityType,
    entityCode,
  );
  const [submitting, setSubmitting] = useState(false);

  const panelRadius =
    rounded === "round" ? token.borderRadiusLG : token.borderRadius;

  const handleSend = async () => {
    const trimmed = text.trim();
    if ((!trimmed && files.length === 0) || submitting) return;

    setSubmitting(true);
    try {
      let finalComment = trimmed;

      if (files.length > 0) {
        if (chatMode === "legacy") {
          await sendWithAttachments({
            comment: trimmed,
            files: files.map((item) => item.file),
          });
          setText("");
          setFiles([]);
          return;
        }

        const uploadPromises = files.map(async ({ file }) => {
          const res = await upload(file);
          const data = res.data?.data || res.data || res;
          const location = data.location || "";
          const name = data.name || file.name;
          const mimeType = data.mimeType || file.type;

          if (isImage(mimeType, location)) {
            return `<img referrerpolicy="no-referrer" src="${location}" alt="${name}" style="max-width:100%; display:block; margin:8px 0;" />`;
          }
          if (isVideo(mimeType, location)) {
            return `<video src="${location}" controls style="max-width:100%; display:block; margin:8px 0;"></video>`;
          }
          return `<a target="_blank" href="${location}" style="display:block; margin:4px 0;"><i class="fa-solid fa-paperclip"></i> ${name}</a>`;
        });

        const htmlTags = await Promise.all(uploadPromises);
        finalComment = htmlTags.join("");
      }

      await send({ comment: finalComment });
      setText("");
      setFiles([]);
    } catch (err) {
      console.error("[ChatPanel] handleSend error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addFile = (file: File) => {
    if (files.length >= 10) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles((current) => [
          ...current,
          { file, preview: event.target?.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    } else {
      setFiles((current) => [...current, { file, preview: "" }]);
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      addFile(file as File);
      inputKeyRef.current += 1;
      return false;
    },
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSend();
    }
  };

  const getInitial = (value: any) => {
    const str = value != null ? String(value) : "?";
    return str.charAt(0).toUpperCase() || "?";
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = new Date(
      typeof timestamp === "number" ? timestamp : String(timestamp),
    );
    if (Number.isNaN(date.getTime())) return String(timestamp);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return String(timestamp);

    const diff = Date.now() - date.getTime();
    const minutes = Math.ceil(diff / (60 * 1000));
    const hours = Math.ceil(diff / (3600 * 1000));

    if (diff <= 59 * 1000) return t("date.recent");
    if (minutes <= 60) return `${minutes} ${t("date.minute")}`;
    if (hours <= 24) return `${hours} ${t("date.hour")}`;
    return formatTime(timestamp);
  };

  const getMessageMeta = (msg: any) => {
    const authorUsername =
      msg.author?.username || msg.createdBy?.username || msg.creator?.username;
    const name =
      msg.from?.card?.fn ||
      msg.author?.fullname ||
      msg.author?.fullName ||
      msg.createdBy?.fullname ||
      msg.createdBy?.fullName ||
      msg.creator?.displayName ||
      msg.creator?.username ||
      t("chat.system");
    const avatar =
      msg.from?.card?.photo ||
      msg.author?.avatar ||
      msg.createdBy?.avatar ||
      msg.creator?.avatar;
    const isStaff = Boolean(
      msg.author?.staff ||
        msg.createdBy?.staff ||
        msg.creator?.staff ||
        msg.staff ||
        msg.senderType === "STAFF",
    );
    const isTrustedCustomer = Boolean(
      msg.from?.trusted?.customer ||
        (profile?.username && authorUsername === profile.username && !isStaff),
    );

    return { name, avatar, isStaff, isTrustedCustomer };
  };

  const normalizeContent = (msg: any) => {
    if (msg.recall) return t("message.deleted_comment");
    return String(
      msg.content?.plainText ??
        msg.content ??
        msg.message ??
        msg.text ??
        msg.comment ??
        "",
    );
  };

  const attachmentUrl = (attachment: any) =>
    attachment.location || attachment.url || attachment.uri || attachment.link;

  const renderAttachment = (attachment: any, index: number) => {
    const url = attachmentUrl(attachment);
    const fileName =
      attachment.name ||
      attachment.fileName ||
      attachment.originalName ||
      `${t("chat.file")} ${index + 1}`;
    const mimeType = attachment.mimeType || attachment.type;
    const image = isImage(mimeType, url);
    const video = isVideo(mimeType, url);

    if (image || video) {
      return (
        <div key={attachment.id ?? `${url}-${index}`} style={{ width: 76 }}>
          <Button
            onClick={() => setPreviewMedia({ ...attachment, url, fileName, image, video })}
            style={{
              width: 76,
              height: 64,
              padding: 0,
              overflow: "hidden",
              borderColor: token.colorBorder,
            }}
          >
            {video ? (
              <PlayCircleOutlined style={{ fontSize: 26, color: token.colorTextTertiary }} />
            ) : (
              <Image
                src={url}
                alt={fileName}
                width={74}
                height={62}
                preview={false}
                referrerPolicy="no-referrer"
                style={{ objectFit: "cover" }}
              />
            )}
          </Button>
          <Tooltip title={fileName}>
            <Text
              type="secondary"
              style={{ display: "block", textAlign: "center", fontSize: token.fontSizeSM }}
            >
              {truncateFileName(fileName, 12)}
            </Text>
          </Tooltip>
        </div>
      );
    }

    return (
      <Button
        key={attachment.id ?? `${url}-${index}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        icon={<FileOutlined />}
      >
        {truncateFileName(fileName)}
      </Button>
    );
  };

  return (
    <Card
      variant="borderless"
      style={{
        height: "100%",
        borderRadius: panelRadius,
        overflow: "hidden",
      }}
      styles={{
        body: {
          height: "100%",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: token.colorBgContainer,
          borderRadius: panelRadius,
        },
      }}
    >
      <Flex
        align="center"
        gap={token.marginSM}
        style={{
          padding: `${token.paddingSM}px ${token.padding}px`,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          background: token.colorPrimaryBg,
        }}
      >
        <MessageOutlined style={{ color: token.colorPrimary }} />
        <Text strong>{t("chat.title")}</Text>
      </Flex>

      <Space
        direction="vertical"
        size={token.marginSM}
        style={{
          padding: token.padding,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          background: token.colorBgElevated,
        }}
      >
        <TextArea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("comment.place_holder")}
          rows={3}
          disabled={submitting}
        />

        <Flex align="center" justify="space-between" gap={token.marginSM}>
          <Upload key={inputKeyRef.current} {...uploadProps}>
            <Tooltip title={t("chat.attach_file")}>
              <Button icon={<PaperClipOutlined />} disabled={submitting} />
            </Tooltip>
          </Upload>

          <Button
            type="primary"
            icon={submitting ? undefined : <SendOutlined />}
            onClick={handleSend}
            disabled={(!text.trim() && files.length === 0) || submitting}
            loading={submitting}
          >
            {t("comment.send")}
          </Button>
        </Flex>

        {files.length > 0 && (
          <Flex wrap="wrap" gap={token.marginSM}>
            {files.map((item, index) => (
              <Card
                key={`${item.file.name}-${index}`}
                size="small"
                styles={{
                  body: {
                    width: 82,
                    padding: token.paddingXXS,
                    position: "relative",
                  },
                }}
              >
                {item.preview ? (
                  <Image
                    src={item.preview}
                    alt={item.file.name}
                    width={72}
                    height={52}
                    preview={false}
                    style={{
                      objectFit: "cover",
                      borderRadius: token.borderRadiusSM,
                    }}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 72,
                      height: 52,
                      borderRadius: token.borderRadiusSM,
                      background: token.colorFillTertiary,
                    }}
                  >
                    <FileOutlined style={{ color: token.colorTextSecondary }} />
                  </Flex>
                )}

                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleFilled />}
                  onClick={() => removeFile(index)}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    color: token.colorError,
                  }}
                />
                <Tooltip title={item.file.name}>
                  <Text
                    ellipsis
                    style={{
                      display: "block",
                      width: 72,
                      marginTop: token.marginXXS,
                      fontSize: token.fontSizeSM,
                    }}
                  >
                    {item.file.name}
                  </Text>
                </Tooltip>
              </Card>
            ))}
          </Flex>
        )}
      </Space>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: token.padding,
          background: token.colorFillQuaternary,
        }}
      >
        {isLoading ? (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Spin />
          </Flex>
        ) : comments.length === 0 ? (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Empty description={t("chat.empty")} />
          </Flex>
        ) : (
          <Space
            direction="vertical"
            size={token.margin}
            style={{ width: "100%" }}
          >
            {hasNextPage && (
              <Button
                block
                size="small"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {t("orderDetail.show_more")}
              </Button>
            )}
            {comments.map((msg: any, index: number) => {
              const { name, avatar, isStaff, isTrustedCustomer } =
                getMessageMeta(msg);
              const content = normalizeContent(msg);
              const time = msg.timestamp ?? msg.createdAt ?? msg.updatedAt ?? "";
              const justify = isStaff ? "flex-start" : "flex-end";
              const attachments = Array.isArray(msg.attachments)
                ? msg.attachments
                : [];

              return (
                <Flex
                  key={msg.id ?? msg._id ?? index}
                  align="flex-start"
                  justify={justify}
                  gap={token.marginSM}
                >
                  {isStaff && (
                    <Avatar
                      src={avatar}
                      style={{ background: token.colorPrimary }}
                    >
                      {!avatar && getInitial(name)}
                    </Avatar>
                  )}

                  <div style={{ maxWidth: "78%", minWidth: 0 }}>
                    <Flex
                      align="center"
                      justify={isStaff ? "flex-start" : "flex-end"}
                      gap={token.marginXS}
                      wrap="wrap"
                      style={{ marginBottom: token.marginXXS }}
                    >
                      <Text strong>{name}</Text>
                      {isTrustedCustomer && (
                        <CrownFilled style={{ color: token.colorWarning }} />
                      )}
                      {isStaff && <Tag color="blue">{t("shipment_log.staff")}</Tag>}
                      {time && <Text type="secondary">, {formatTimeAgo(time)}</Text>}
                    </Flex>

                    <Card
                      size="small"
                      styles={{
                        body: {
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          background: isStaff
                            ? token.colorBgContainer
                            : token.colorPrimaryBg,
                          borderRadius: token.borderRadiusLG,
                        },
                      }}
                    >
                      {/<[a-z][\s\S]*>/i.test(content) ? (
                        <div
                          style={{ wordBreak: "break-word" }}
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <div
                          style={{ marginBottom: 0, wordBreak: "break-word" }}
                          dangerouslySetInnerHTML={{ __html: linkify(content) }}
                        />
                      )}

                      {attachments.length > 0 && (
                        <Flex
                          wrap="wrap"
                          gap={token.marginXS}
                          style={{ marginTop: token.marginSM }}
                        >
                          {attachments.map(renderAttachment)}
                        </Flex>
                      )}
                    </Card>
                  </div>

                  {!isStaff && (
                    <Avatar
                      src={avatar}
                      style={{ background: token.colorSuccess }}
                    >
                      {!avatar && getInitial(name)}
                    </Avatar>
                  )}
                </Flex>
              );
            })}
          </Space>
        )}
      </div>
      <Modal
        open={!!previewMedia}
        footer={null}
        width={760}
        title={previewMedia?.fileName}
        onCancel={() => setPreviewMedia(null)}
      >
        {previewMedia?.video ? (
          <video
            width="100%"
            height={500}
            controls
            src={previewMedia.url}
          >
            {previewMedia.fileName}
          </video>
        ) : previewMedia?.image ? (
          <Image
            src={previewMedia.url}
            alt={previewMedia.fileName}
            width="100%"
            preview={false}
            referrerPolicy="no-referrer"
          />
        ) : null}
      </Modal>
    </Card>
  );
};
