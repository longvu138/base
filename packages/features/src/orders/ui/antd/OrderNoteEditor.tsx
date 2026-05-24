import { useEffect, useRef, useState } from "react";
import { Button, Input, Space, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

export type OrderNoteEditorProps = {
  record: any;
  updateOrderNote: any;
};

export const OrderNoteEditor = ({
  record,
  updateOrderNote,
}: OrderNoteEditorProps) => {
  const [editingNoteCode, setEditingNoteCode] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");
  const noteInputRef = useRef<any>(null);
  const savingNoteCodeRef = useRef<string | null>(null);
  const isEditing = editingNoteCode === record?.code;

  useEffect(() => {
    if (!isEditing) return;

    const animationFrame = window.requestAnimationFrame(() => {
      const textArea =
        noteInputRef.current?.resizableTextArea?.textArea ||
        noteInputRef.current?.nativeElement ||
        noteInputRef.current;
      const length = textArea?.value?.length || 0;

      textArea?.focus?.();
      textArea?.setSelectionRange?.(length, length);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isEditing]);

  const startEditOrderNote = () => {
    setEditingNoteCode(record?.code || null);
    setEditingNoteValue(record?.note || "");
  };

  const saveOrderNote = () => {
    if (!record?.code || savingNoteCodeRef.current === record.code) return;

    savingNoteCodeRef.current = record.code;
    if (editingNoteValue !== (record?.note || "")) {
      updateOrderNote
        .mutateAsync({
          code: record.code,
          note: editingNoteValue,
        })
        .finally(() => {
          savingNoteCodeRef.current = null;
        });
    } else {
      savingNoteCodeRef.current = null;
    }
    setEditingNoteCode(null);
    setEditingNoteValue("");
  };

  return (
    <Space align="start">
      {isEditing ? (
        <Input.TextArea
          ref={noteInputRef}
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={editingNoteValue}
          onChange={(event) => setEditingNoteValue(event.target.value)}
          onBlur={saveOrderNote}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveOrderNote();
            }
            if (event.key === "Escape") {
              setEditingNoteCode(null);
              setEditingNoteValue("");
            }
          }}
          style={{ width: "100%" }}
        />
      ) : (
        <Typography.Text type="secondary">
          {record?.note || "---"}
        </Typography.Text>
      )}
      {!isEditing && (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={startEditOrderNote}
        />
      )}
    </Space>
  );
};
