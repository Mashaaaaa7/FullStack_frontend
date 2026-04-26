import React, { useCallback, useMemo, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { useAuth } from "../../../Context/AuthContext.tsx";
import { getErrorMessage, pdfApi } from "../../../api/api.ts";
import "../../../App.css";

interface FileUploaderProps {
    onUploadSuccess?: () => void;
    maxSizeMB?: number;
    allowedTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                       onUploadSuccess,
                                                       maxSizeMB = 10,
                                                       allowedTypes = ["application/pdf"],
                                                   }) => {
    const { user, loading: authLoading } = useAuth();
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const accept = useMemo<Accept>(() => {
        return allowedTypes.reduce<Accept>((acc, type) => {
            acc[type] = [];
            return acc;
        }, {});
    }, [allowedTypes]);

    const validateFile = (file: File): string | null => {
        if (!allowedTypes.includes(file.type)) {
            return `Недопустимый тип файла. Разрешены: ${allowedTypes.join(", ")}`;
        }

        if (file.size > maxSizeBytes) {
            return `Файл слишком большой. Максимальный размер: ${maxSizeMB} МБ.`;
        }

        return null;
    };

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setError(null);
            setUploadProgress(0);

            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            setIsUploading(true);

            try {
                await pdfApi.uploadPDF(file, setUploadProgress);
                setUploadProgress(100);
                onUploadSuccess?.();
            } catch (err: unknown) {
                setError(getErrorMessage(err) || "Ошибка загрузки");
            } finally {
                setIsUploading(false);
            }
        },
        [allowedTypes, maxSizeBytes, maxSizeMB, onUploadSuccess]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize: maxSizeBytes,
        multiple: false,
        disabled: isUploading,
    });

    if (authLoading) {
        return <div className="uploader-loading">Загрузка данных пользователя...</div>;
    }

    if (!user) {
        return (
            <div className="uploader-not-authorized">
                Пожалуйста, <a href="/login">войдите в систему</a>, чтобы загружать файлы.
            </div>
        );
    }

    return (
        <div className="file-uploader">
            <div
                {...getRootProps()}
                className={`upload-area ${isDragActive ? "drag-over" : ""} ${
                    isUploading ? "disabled" : ""
                }`}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <p>Загрузка... {uploadProgress}%</p>
                ) : isDragActive ? (
                    <p>Отпустите файл для загрузки</p>
                ) : (
                    <p>
                        Перетащите PDF-файл сюда или кликните для выбора
                        <br />
                        <small>(макс. {maxSizeMB} МБ)</small>
                    </p>
                )}
            </div>

            {isUploading && (
                <div className="progress-bar" style={{ marginTop: "10px" }}>
                    <div
                        style={{
                            height: "8px",
                            width: `${uploadProgress}%`,
                            backgroundColor: "#4caf50",
                            borderRadius: "4px",
                            transition: "width 0.2s",
                        }}
                    />
                </div>
            )}

            {error && (
                <div className="error" style={{ color: "red", marginTop: "10px" }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUploader;