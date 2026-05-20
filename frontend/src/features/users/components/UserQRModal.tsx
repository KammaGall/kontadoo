import { useGenerateQRMutation } from "../usersApi";
import { useEffect, useState } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { Download } from "lucide-react";

interface UserQRModalProps {
  user: any | null; // Может быть null!
  isOpen: boolean;
  onClose: () => void;
}

export const UserQRModal = ({ user, isOpen, onClose }: UserQRModalProps) => {
  const [generateQR, { isLoading }] = useGenerateQRMutation();
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      generateQR(user.id)
        .unwrap()
        .then((data) => setQrCode(data.qrCode))
        .catch(() => {});
    }
  }, [isOpen, user]);

  const handleDownload = () => {
    if (!qrCode || !user) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-${user.login}.png`;
    link.click();
  };

  // Если user равен null — не рендерим содержимое
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR-код для входа">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          {user.firstName} {user.lastName}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <img src={qrCode} alt="QR-код" className="mx-auto w-64 h-64" />
            <p className="text-xs text-gray-500">QR-код действителен 24 часа</p>
            <button
              onClick={handleDownload}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download size={16} />
              Скачать
            </button>
          </div>
        ) : (
          <p className="text-red-600">Не удалось сгенерировать QR-код</p>
        )}
      </div>
    </Modal>
  );
};
