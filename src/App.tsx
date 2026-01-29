import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, RefreshCw, Receipt, Type, Image as ImageIcon, Settings, Plus, X, Move, Upload, FileText, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import html2canvas from 'html2canvas'; // @ts-ignore
import { jsPDF } from 'jspdf';

// Available fonts
const FONTS = [
  { name: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { name: 'Kanit', value: 'Kanit' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
];

interface TextStyle {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  color: string;
  wordSpacing?: number;
  letterSpacing?: number;
  lineHeight?: number;
}

interface ReceiptData {
  amount: string;
  status: string;
  date: string;
  time: string;
  transactionNo: string;
  merchantName: string;
  merchantOrderNo: string;
  footerText: string;
  transactionNoLabel?: string;
  merchantNameLabel?: string;
  merchantOrderNoLabel?: string;
}

interface WatermarkLogo {
  id: string;
  x: number;
  y: number;
  opacity: number;
  size: number;
  inverted: boolean;
  rotation: number;
}

interface ReceiptStyles {
  amount: TextStyle;
  currencySymbol: TextStyle;
  status: TextStyle;
  dateTime: TextStyle;
  labels: TextStyle;
  values: TextStyle;
  transactionNoValue: TextStyle;
  merchantNameValue: TextStyle;
  merchantOrderNoValue: TextStyle;
  footer: TextStyle;
  headerTitle: TextStyle;
  borderSize: number;
  borderQuantity: number;
  borderColor: string;
  watermarkOpacity: number;
  customWatermarkOpacity: number;
  watermarkSize: number;
  receiptWidth: number;
  receiptHeight: number | 'auto'; // 'auto' or number
  contentPadding: number;
  borderPadding: number;
  dashedLineThickness: number;
  dashedLineSpacing: number;
  globalFont: string;
  topBorderOffset: number;
  bottomBorderOffset: number;
  headerLogoHeight: number;
  headerPaddingX: number;
  borderStretch: number;
}

const defaultReceipt: ReceiptData = {
  amount: '87,411.17',
  status: 'Successful',
  date: 'Nov 29th, 2025',
  time: '16:41:00',
  transactionNo: '251129140300905256951904',
  merchantName: 'Paystack Payment Limited',
  merchantOrderNo: 'paystack_56966788449_q31kj',
  footerText: 'Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.',
  transactionNoLabel: 'Transaction No.',
  merchantNameLabel: 'Merchant Name',
  merchantOrderNoLabel: 'Merchant Order No.',
};

const defaultStyles: ReceiptStyles = {
  amount: { fontSize: 40, fontWeight: 700, fontFamily: 'Roboto', color: '#09b879', letterSpacing: 0 },
  currencySymbol: { fontSize: 42, fontWeight: 700, fontFamily: 'Roboto', color: '#09b879', letterSpacing: 0 },
  status: { fontSize: 22, fontWeight: 400, fontFamily: 'Arial, sans-serif', color: '#333333' },
  dateTime: { fontSize: 17, fontWeight: 400, fontFamily: 'Arial, sans-serif', color: '#888888' },
  labels: { fontSize: 18, fontWeight: 400, fontFamily: 'Arial, sans-serif', color: '#888888' },
  values: { fontSize: 17, fontWeight: 500, fontFamily: 'Arial, sans-serif', color: '#333333' },
  transactionNoValue: { fontSize: 17, fontWeight: 500, fontFamily: 'Arial, sans-serif', color: '#333333' },
  merchantNameValue: { fontSize: 17, fontWeight: 500, fontFamily: 'Arial, sans-serif', color: '#333333' },
  merchantOrderNoValue: { fontSize: 17, fontWeight: 500, fontFamily: 'Arial, sans-serif', color: '#333333' },
  footer: { fontSize: 17, fontWeight: 400, fontFamily: 'Roboto', color: '#999999', lineHeight: 1.2, wordSpacing: 0, letterSpacing: 0 },
  headerTitle: { fontSize: 18, fontWeight: 400, fontFamily: 'Roboto', color: '#333333' },
  borderSize: 22,
  borderQuantity: 14,
  borderColor: '#000000',
  watermarkOpacity: 0,
  watermarkSize: 60,
  customWatermarkOpacity: 0.04,
  receiptWidth: 509,
  receiptHeight: 'auto',
  contentPadding: 26,
  borderPadding: 15,
  dashedLineThickness: 1.1,
  dashedLineSpacing: 5,
  globalFont: 'Roboto-Regular',
  topBorderOffset: -2,
  bottomBorderOffset: 2,
  headerLogoHeight: 31,
  headerPaddingX: 4,
  borderStretch: 0.8,
};

const defaultCustomLogos: WatermarkLogo[] = [
  { id: "1769682044252", x: 15.05, y: 21.91, opacity: 0.05, size: 85, inverted: false, rotation: 340 },
  { id: "1769682075151", x: 37.55, y: 8.58, opacity: 0.1, size: 85, inverted: false, rotation: 340 },
  { id: "1769684079114", x: 72.75, y: 8.41, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684125424", x: 87.96, y: 22.81, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684155753", x: 53.59, y: 21.10, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684170562", x: -1, y: 8.5, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684209182", x: -0.5, y: 33.95, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684244216", x: 34.84, y: 36.01, opacity: 0.1, size: 75, inverted: false, rotation: 340 },
  { id: "1769684263282", x: 18.7, y: 47.66, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684298872", x: 55.5, y: 47.71, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684396298", x: 87.75, y: 47.67, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684445863", x: 36.50, y: 59.14, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684474184", x: 67.75, y: 60.51, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684499001", x: 18.80, y: 72.7, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684532871", x: 54.00, y: 73.71, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684554536", x: 89.42, y: 73.37, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684576895", x: -0.5, y: 59.31, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684616079", x: -1, y: 85.02, opacity: 0.1, size: 80, inverted: false, rotation: 340 },
  { id: "1769684640189", x: 29.00, y: 86.22, opacity: 0.1, size: 65, inverted: false, rotation: 340 },
  { id: "1769684735344", x: 71.71, y: 84.68, opacity: 0.1, size: 70, inverted: false, rotation: 340 },
  { id: "1769684757846", x: 20.1, y: 98, opacity: 0.1, size: 75, inverted: false, rotation: 340 },
  { id: "1769684814177", x: 53.59, y: 98.8, opacity: 0.1, size: 75, inverted: false, rotation: 340 },
  { id: "1769684852957", x: 91.50, y: 99.5, opacity: 0.1, size: 75, inverted: false, rotation: 340 },
  { id: "1769684893049", x: 74.21, y: 35.83, opacity: 0.05, size: 75, inverted: false, rotation: 340 },
];

// Scalloped border with rounded edges and stretch support
function ScallopedBorder({ position, size, quantity, width, color, stretch = 1 }: { position: 'top' | 'bottom'; size: number; quantity: number; width: number; color: string; stretch?: number }) {
  const circles = quantity;
  const circleSize = size;
  const spacing = width / circles;

  return (
    <div className="flex justify-center bg-transparent overflow-hidden relative z-20" style={{ height: `${circleSize}px` }}>
      <svg width={width} height={circleSize} viewBox={`0 0 ${width} ${circleSize}`} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <clipPath id={`scallop-${position}`}>
            {Array.from({ length: circles }).map((_, i) => (
              <ellipse
                key={i}
                cx={i * spacing + spacing / 2}
                cy={position === 'top' ? 0 : circleSize}
                rx={(spacing / 2) * stretch}
                ry={circleSize / 2}
              />
            ))}
          </clipPath>
        </defs>
        <rect
          width={width}
          height={circleSize}
          fill={color}
          clipPath={`url(#scallop-${position})`}
        />
      </svg>
    </div>
  );
}


// Editable Text Component
function EditableText({
  value,
  style,
  onSave,
  className
}: {
  value: string;
  style: React.CSSProperties;
  onSave: (val: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onSave(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-auto p-0 border-none bg-transparent focus-visible:ring-0 rounded-none w-full text-right"
        style={{
          ...style,
          width: '100%',
          display: 'inline-block',
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => {
        setTempValue(value);
        setIsEditing(true);
      }}
      className={`cursor-text hover:bg-gray-50 rounded px-1 -mx-1 transition-colors ${className || ''}`}
      style={style}
      title="Double-click to edit"
    >
      {value}
    </span>
  );
}

function ReceiptComponent({
  data,
  styles,
  customLogos,
  onBackgroundClick,
  isAddingWatermark,
  onUpdateLogo,
  onSelectLogo,
  selectedLogoId,
  logoSrcs,
  onDataChange
}: {
  data: ReceiptData;
  styles: ReceiptStyles;
  customLogos: WatermarkLogo[];
  onBackgroundClick?: (e: React.MouseEvent) => void;
  isAddingWatermark: boolean;
  onUpdateLogo?: (id: string, updates: Partial<WatermarkLogo>) => void;
  onSelectLogo?: (id: string) => void;
  selectedLogoId?: string | null;
  logoSrcs: { grayscale: string; inverted: string; };
  onDataChange?: (field: keyof ReceiptData, value: string) => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (isAddingWatermark) return;
    e.stopPropagation();
    setDraggingId(id);
    onSelectLogo?.(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !receiptRef.current || !onUpdateLogo) return;

    const rect = receiptRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values to 0-100%
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onUpdateLogo(draggingId, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      ref={receiptRef}
      className="relative bg-white overflow-hidden select-none shadow-2xl"
      style={{
        width: `${styles.receiptWidth}px`,
        minHeight: styles.receiptHeight === 'auto' ? undefined : `${styles.receiptHeight}px`,
        height: styles.receiptHeight === 'auto' ? undefined : `${styles.receiptHeight}px`,
        fontFamily: styles.globalFont,
        cursor: isAddingWatermark ? 'crosshair' : 'default'
      }}
      onClick={onBackgroundClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Watermark Pattern */}


      {/* Custom placed logos (HTML impl with pre-processed sources) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 20 }}
      >
        {customLogos.map((logo) => (
          <div
            key={logo.id}
            className="absolute"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.size}px`,
              height: `${(logo.size * 30) / 90}px`,
              transform: `translate(-50%, -50%) rotate(${logo.rotation || 0}deg)`,
              pointerEvents: 'auto', // Wrapper handles events if needed, but img has them too
            }}
          >
            {selectedLogoId === logo.id && (
              <div
                className="absolute inset-0 border-2 border-blue-500 rounded-sm"
                style={{ transform: 'scale(1.1)', pointerEvents: 'none' }}
              />
            )}
            <img
              src={logo.inverted ? logoSrcs.inverted : logoSrcs.grayscale}
              alt=""
              className="w-full h-full cursor-move"
              style={{
                opacity: styles.customWatermarkOpacity,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, logo.id);
              }}
            />
          </div>
        ))}
      </div>

      {/* Tiled Watermark Background using SVG for robust capture */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >

        {/* Render background pattern pattern */}
        <g style={{ opacity: styles.watermarkOpacity }}>
          {Array.from({ length: 40 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const x = (col * 100) + (row % 2 === 0 ? 0 : 50) - 40;
            const y = row * 80 - 20;

            return (
              <image
                key={i}
                href={logoSrcs.grayscale}
                x={x}
                y={y}
                width="90"
                height="30"
                transform={`rotate(-45, ${x + 45}, ${y + 15})`}
              />
            );
          })}
        </g>
      </svg>

      {/* Top scalloped border */}
      <div
        className="relative z-20"
        style={{
          padding: `0 ${styles.borderPadding}px`,
          transform: `translateY(${styles.topBorderOffset}px)`
        }}
      >
        <ScallopedBorder position="top" size={styles.borderSize} quantity={styles.borderQuantity} width={styles.receiptWidth - (styles.borderPadding * 2)} color={styles.borderColor} stretch={styles.borderStretch || 1} />
      </div>

      {/* Receipt Content */}
      <div className="pt-5 pb-4 relative z-10" style={{ paddingLeft: `${styles.contentPadding}px`, paddingRight: `${styles.contentPadding}px` }}>
        {/* Header */}
        <div
          className="flex justify-between items-center mb-8"
          style={{ paddingLeft: `${styles.headerPaddingX}px`, paddingRight: `${styles.headerPaddingX}px` }}
        >
          {/* OPay Logo */}
          <img
            src="/opay-logo.png"
            alt="OPay"
            style={{ height: `${styles.headerLogoHeight}px`, width: 'auto' }}
          />
          <span
            style={{
              fontSize: `${styles.headerTitle.fontSize}px`,
              fontWeight: styles.headerTitle.fontWeight,
              fontFamily: styles.headerTitle.fontFamily,
              color: styles.headerTitle.color,
            }}
          >
            Transaction Receipt
          </span>
        </div>

        {/* Amount */}
        <div className="text-center mb-2">
          <span
            style={{
              fontSize: `${styles.currencySymbol.fontSize}px`,
              fontWeight: styles.currencySymbol.fontWeight,
              fontFamily: styles.currencySymbol.fontFamily,
              color: styles.currencySymbol.color,
              marginRight: '2px'
            }}
          >
            ₦
          </span>
          <span
            style={{
              fontSize: `${styles.amount.fontSize}px`,
              fontWeight: styles.amount.fontWeight,
              fontFamily: styles.amount.fontFamily,
              color: styles.amount.color,
              letterSpacing: `${styles.amount.letterSpacing || -0.5}px`
            }}
          >
            <EditableText
              value={data.amount}
              onSave={(val) => onDataChange?.('amount', val)}
              className="text-center"
              style={{ display: 'inline' }}
            />
          </span>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          <span
            style={{
              fontSize: `${styles.status.fontSize}px`,
              fontWeight: styles.status.fontWeight,
              fontFamily: styles.status.fontFamily,
              color: styles.status.color,
            }}
          >
            {data.status}
          </span>
        </div>

        {/* Date & Time */}
        <div className="text-center mb-8">
          <span
            style={{
              fontSize: `${styles.dateTime.fontSize}px`,
              fontWeight: styles.dateTime.fontWeight,
              fontFamily: styles.dateTime.fontFamily,
              color: styles.dateTime.color,
            }}
          >
            <EditableText
              value={data.date}
              onSave={(val) => onDataChange?.('date', val)}
              style={{}}
            />
            {' '}
            <EditableText
              value={data.time}
              onSave={(val) => onDataChange?.('time', val)}
              style={{}}
            />
          </span>
        </div>

        {/* Divider */}
        <div
          className="mb-6 w-full"
          style={{ height: `${styles.dashedLineThickness}px` }}
        >
          <svg width="100%" height={styles.dashedLineThickness} preserveAspectRatio="none">
            <line
              x1="0"
              y1={styles.dashedLineThickness / 2}
              x2="100%"
              y2={styles.dashedLineThickness / 2}
              stroke="#ddd"
              strokeWidth={styles.dashedLineThickness}
              strokeDasharray={`5, ${styles.dashedLineSpacing}`}
            />
          </svg>
        </div>

        {/* Transaction Details */}
        <div className="space-y-5 mb-6">
          <div className="flex justify-between items-start">
            <EditableText
              value={data.transactionNoLabel || 'Transaction No.'}
              onSave={(val) => onDataChange?.('transactionNoLabel', val)}
              style={{
                fontSize: `${styles.labels.fontSize}px`,
                fontWeight: styles.labels.fontWeight,
                fontFamily: styles.labels.fontFamily,
                color: styles.labels.color,
              }}
            />
            <EditableText
              value={data.transactionNo}
              onSave={(val) => onDataChange?.('transactionNo', val)}
              className="text-right"
              style={{
                fontSize: `${styles.transactionNoValue.fontSize}px`,
                fontWeight: styles.transactionNoValue.fontWeight,
                fontFamily: styles.transactionNoValue.fontFamily,
                color: styles.transactionNoValue.color,
                maxWidth: '55%',
                wordBreak: 'break-all',
                display: 'block',
                marginLeft: 'auto'
              }}
            />
          </div>



          <div className="flex justify-between items-start">
            <EditableText
              value={data.merchantNameLabel || 'Merchant Name'}
              onSave={(val) => onDataChange?.('merchantNameLabel', val)}
              style={{
                fontSize: `${styles.labels.fontSize}px`,
                fontWeight: styles.labels.fontWeight,
                fontFamily: styles.labels.fontFamily,
                color: styles.labels.color,
              }}
            />
            <EditableText
              value={data.merchantName}
              onSave={(val) => onDataChange?.('merchantName', val)}
              className="text-right"
              style={{
                fontSize: `${styles.merchantNameValue.fontSize}px`,
                fontWeight: styles.merchantNameValue.fontWeight,
                fontFamily: styles.merchantNameValue.fontFamily,
                color: styles.merchantNameValue.color,
                maxWidth: '55%',
                wordBreak: 'break-word',
                display: 'block',
                marginLeft: 'auto'
              }}
            />
          </div>



          <div className="flex justify-between items-start">
            <EditableText
              value={data.merchantOrderNoLabel || 'Merchant Order No.'}
              onSave={(val) => onDataChange?.('merchantOrderNoLabel', val)}
              style={{
                fontSize: `${styles.labels.fontSize}px`,
                fontWeight: styles.labels.fontWeight,
                fontFamily: styles.labels.fontFamily,
                color: styles.labels.color,
              }}
            />
            <EditableText
              value={data.merchantOrderNo}
              onSave={(val) => onDataChange?.('merchantOrderNo', val)}
              className="text-right"
              style={{
                fontSize: `${styles.merchantOrderNoValue.fontSize}px`,
                fontWeight: styles.merchantOrderNoValue.fontWeight,
                fontFamily: styles.merchantOrderNoValue.fontFamily,
                color: styles.merchantOrderNoValue.color,
                maxWidth: '55%',
                wordBreak: 'break-all',
                display: 'block',
                marginLeft: 'auto'
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          className="mb-5 w-full"
          style={{ height: `${styles.dashedLineThickness}px` }}
        >
          <svg width="100%" height={styles.dashedLineThickness} preserveAspectRatio="none">
            <line
              x1="0"
              y1={styles.dashedLineThickness / 2}
              x2="100%"
              y2={styles.dashedLineThickness / 2}
              stroke="#ddd"
              strokeWidth={styles.dashedLineThickness}
              strokeDasharray={`5, ${styles.dashedLineSpacing}`}
            />
          </svg>
        </div>

        {/* Footer Text */}
        <p
          style={{
            fontSize: `${styles.footer.fontSize}px`,
            fontWeight: styles.footer.fontWeight,
            fontFamily: styles.footer.fontFamily,
            color: styles.footer.color,
            textAlign: 'justify',
            lineHeight: styles.footer.lineHeight || 1.6,
            wordSpacing: `${styles.footer.wordSpacing || 0}px`
          }}
        >
          {data.footerText}
        </p>
      </div >

      {/* Bottom scalloped border */}
      <div
        className="relative z-20"
        style={{
          padding: `0 ${styles.borderPadding}px`,
          transform: `translateY(${styles.bottomBorderOffset}px)`
        }}
      >
        <ScallopedBorder position="bottom" size={styles.borderSize} quantity={styles.borderQuantity} width={styles.receiptWidth - (styles.borderPadding * 2)} color={styles.borderColor} stretch={styles.borderStretch || 1} />
      </div>
    </div>
  );
}

// Text Style Editor Component
function TextStyleEditor({
  label,
  style,
  onChange,
  fonts
}: {
  label: string;
  style: TextStyle;
  onChange: (style: TextStyle) => void;
  fonts: { name: string; value: string }[];
}) {
  const updateStyle = (key: keyof TextStyle, value: string | number) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
      <Label className="font-semibold text-sm">{label}</Label>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Size (px)</Label>
          <Input
            type="number"
            value={style.fontSize}
            onChange={(e) => updateStyle('fontSize', parseInt(e.target.value) || 12)}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Weight</Label>
          <select
            value={style.fontWeight}
            onChange={(e) => updateStyle('fontWeight', parseInt(e.target.value))}
            className="w-full px-2 py-1.5 border rounded text-sm h-8"
          >
            <option value={100}>Thin (100)</option>
            <option value={200}>Extra Light (200)</option>
            <option value={300}>Light (300)</option>
            <option value={400}>Regular (400)</option>
            <option value={500}>Medium (500)</option>
            <option value={600}>Semi Bold (600)</option>
            <option value={700}>Bold (700)</option>
            <option value={800}>Extra Bold (800)</option>
            <option value={900}>Black (900)</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Font Family</Label>
        <select
          value={style.fontFamily}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
          className="w-full px-2 py-1.5 border rounded text-sm"
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value}>{font.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={style.color}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />
          <Input
            value={style.color}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="flex-1 h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Word Spacing (px)</Label>
          <Input
            type="number"
            value={style.wordSpacing || 0}
            onChange={(e) => updateStyle('wordSpacing', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Line Height</Label>
          <Input
            type="number"
            value={style.lineHeight || 1.6}
            onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value) || 1.6)}
            step={0.1}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-500">Letter Spacing (px)</Label>
        <Input
          type="number"
          value={style.letterSpacing || 0}
          onChange={(e) => updateStyle('letterSpacing', parseFloat(e.target.value) || 0)}
          step={0.5}
          className="h-8"
        />
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [availableFonts, setAvailableFonts] = useState(FONTS);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingTab, setPendingTab] = useState<'content' | 'styles' | 'watermarks' | null>(null);

  const handleTabClick = (tab: 'content' | 'styles' | 'watermarks') => {
    if (tab === 'content') {
      setActiveTab(tab);
    } else {
      if (isUnlocked) {
        setActiveTab(tab);
      } else {
        setPendingTab(tab);
        setShowPinDialog(true);
        setPinInput('');
      }
    }
  };

  const handleUnlock = () => {
    if (pinInput === '17241522') {
      setIsUnlocked(true);
      setShowPinDialog(false);
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } else {
      alert('Incorrect PIN');
      setPinInput('');
    }
  };

  // Load default fonts
  useEffect(() => {
    const loadDefaultFonts = async () => {
      try {
        const kanit = new FontFace('Kanit', 'url(/fonts/Kanit-Regular.ttf)');
        const roboto = new FontFace('Roboto', 'url(/fonts/Roboto-Regular.ttf)');
        const robotoBold = new FontFace('Roboto', 'url(/fonts/Roboto-Bold.ttf)', { weight: '700' });

        await Promise.all([kanit.load(), roboto.load(), robotoBold.load()]);

        document.fonts.add(kanit);
        document.fonts.add(roboto);
        document.fonts.add(robotoBold);
      } catch (err) {
        console.error('Failed to load default fonts:', err);
      }
    };
    loadDefaultFonts();
  }, []);

  const [receiptData, setReceiptData] = useState<ReceiptData>(() => {
    const saved = localStorage.getItem('opayReceiptData');
    if (saved) {
      try {
        return { ...defaultReceipt, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load receipt data');
      }
    }
    return defaultReceipt;
  });

  const [styles, setStyles] = useState<ReceiptStyles>(() => {
    const saved = localStorage.getItem('opayReceiptStyles');
    if (saved) {
      try {
        return { ...defaultStyles, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load styles');
      }
    }
    return defaultStyles;
  });

  const [customLogos, setCustomLogos] = useState<WatermarkLogo[]>(() => {
    const saved = localStorage.getItem('opayReceiptLogos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load logos');
      }
    }
    return defaultCustomLogos;
  });

  // Mobile Scaling Logic
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      // 32px padding (py-6 px-4 -> 16px*2) + safe area
      const wrapperWidth = window.innerWidth - 32;
      const receiptWidth = styles.receiptWidth + (styles.borderPadding * 2) + 40; // +40 safety margin

      if (receiptWidth > wrapperWidth) {
        setScale(wrapperWidth / receiptWidth);
      } else {
        setScale(1);
      }
    };

    // Initial and on updates
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [styles.receiptWidth, styles.borderPadding]);

  const [isAddingWatermark, setIsAddingWatermark] = useState(false);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const selectedLogo = customLogos.find(l => l.id === selectedLogoId);
  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'watermarks'>('content');
  const receiptRef = useRef<HTMLDivElement>(null);

  const [logoSrcs, setLogoSrcs] = useState({ grayscale: '/opay-logo.png', inverted: '/opay-logo.png' });

  // Pre-process logo for robust capture (filters often fail in html2canvas)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = '/opay-logo.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate Grayscale
      ctx.drawImage(img, 0, 0);
      let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Luminosity formula
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
      const grayscale = canvas.toDataURL();

      // Generate White (Inverted/Brightness)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Force white, preserve alpha
        if (data[i + 3] > 0) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const inverted = canvas.toDataURL();

      setLogoSrcs({ grayscale, inverted });
    };
  }, []);

  // Migration: Fix legacy default opacity (0.0 for new users)
  // Also initialize customWatermarkOpacity if missing
  useEffect(() => {
    setStyles(prev => {
      let next = { ...prev };
      if (next.watermarkOpacity === 0.1) {
        next.watermarkOpacity = 0.0;
      }
      if (next.customWatermarkOpacity === undefined) {
        next.customWatermarkOpacity = 0.2;
      }
      return next;
    });
  }, []);

  // Force migration to Roboto Bold for existing users if using old defaults
  useEffect(() => {
    setStyles(prev => {
      const next = { ...prev };
      let changed = false;

      // Check if amount is using old default (Kanit regular or just need to enforce Bold)
      // We'll enforce Roboto Bold for Amount and Currency if they are not already set to something custom different than our target
      // Or simpler: just enforce it once by checking a flag. But we don't have a flag.
      // Let's check if it matches the *old* default, then upgrade it. 
      // Old default was Kanit/400 or Kanit/600.
      if (next.amount.fontFamily === 'Kanit' || (next.amount.fontFamily === 'Roboto' && next.amount.fontWeight !== 700)) {
        next.amount = { ...next.amount, fontFamily: 'Roboto', fontWeight: 700, letterSpacing: 0 };
        changed = true;
      }

      if (next.currencySymbol.fontFamily === 'Roboto' && next.currencySymbol.fontWeight !== 700) {
        next.currencySymbol = { ...next.currencySymbol, fontFamily: 'Roboto', fontWeight: 700 };
        changed = true;
      }

      if (next.headerTitle.fontFamily !== 'Roboto') {
        next.headerTitle = { ...next.headerTitle, fontFamily: 'Roboto', fontWeight: 400 };
        changed = true;
      }

      if (next.footer.fontFamily !== 'Roboto') {
        next.footer = { ...next.footer, fontFamily: 'Roboto', fontWeight: 400 };
        changed = true;
      }

      return changed ? next : prev;
    });
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('opayReceiptData', JSON.stringify(receiptData));
  }, [receiptData]);

  useEffect(() => {
    localStorage.setItem('opayReceiptStyles', JSON.stringify(styles));
  }, [styles]);

  useEffect(() => {
    localStorage.setItem('opayReceiptLogos', JSON.stringify(customLogos));
  }, [customLogos]);

  const handleInputChange = (field: keyof ReceiptData, value: string) => {
    setReceiptData(prev => ({ ...prev, [field]: value }));
  };

  const updateStyle = (key: keyof ReceiptStyles, value: any) => {
    setStyles(prev => {
      const newStyles = { ...prev, [key]: value };

      // If updating the general 'values' style, sync it to specific value fields
      if (key === 'values') {
        newStyles.transactionNoValue = { ...newStyles.transactionNoValue, ...value };
        newStyles.merchantNameValue = { ...newStyles.merchantNameValue, ...value };
        newStyles.merchantOrderNoValue = { ...newStyles.merchantOrderNoValue, ...value };
      }

      return newStyles;
    });
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (!isAddingWatermark) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newLogo: WatermarkLogo = {
      id: Date.now().toString(),
      x,
      y,
      opacity: 0.1,
      size: 50,
      inverted: false,
      rotation: 340, // Default to 340deg as requested
    };

    setCustomLogos(prev => [...prev, newLogo]);
    setSelectedLogoId(newLogo.id);
    setIsAddingWatermark(false);
  };

  const updateLogo = (id: string, updates: Partial<WatermarkLogo>) => {
    setCustomLogos(prev => prev.map(logo =>
      logo.id === id ? { ...logo, ...updates } : logo
    ));
  };

  const removeLogo = (id: string) => {
    setCustomLogos(prev => prev.filter(logo => logo.id !== id));
    if (selectedLogoId === id) setSelectedLogoId(null);
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(async (file) => {
        const fontName = file.name.split('.')[0];
        const fontUrl = URL.createObjectURL(file);
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        try {
          const loadedFont = await fontFace.load();
          document.fonts.add(loadedFont);
          const newFont = { name: fontName, value: fontName };
          setAvailableFonts(prev => {
            // Avoid duplicates
            if (prev.some(f => f.value === fontName)) return prev;
            return [...prev, newFont];
          });

          // If singular file, update global font (optional UX choice, keeping logic simple: if 1 file, apply it)
          if (files.length === 1) {
            setStyles(prev => {
              const newStyles = { ...prev, globalFont: fontName };
              const textKeys: (keyof ReceiptStyles)[] = ['amount', 'currencySymbol', 'status', 'dateTime', 'labels', 'values', 'transactionNoValue', 'merchantNameValue', 'merchantOrderNoValue', 'footer', 'headerTitle'];

              textKeys.forEach(key => {
                if (typeof newStyles[key] === 'object') {
                  (newStyles[key] as TextStyle).fontFamily = fontName;
                }
              });

              return newStyles;
            });
          }
        } catch (error) {
          console.error('Failed to load font', error);
        }
      });
    }
  };

  const handleAmountFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = file.name.split('.')[0] + '-amount-' + Date.now();
      const fontUrl = URL.createObjectURL(file);
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      try {
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
        const newFont = { name: file.name.split('.')[0], value: fontName }; // Use friendly name for UI but unique fontName for CSS
        setAvailableFonts(prev => [...prev, newFont]);

        // Update ONLY Amount and Currency Symbol
        setStyles(prev => ({
          ...prev,
          amount: { ...prev.amount, fontFamily: fontName },
          currencySymbol: { ...prev.currencySymbol, fontFamily: fontName }
        }));
      } catch (error) {
        console.error('Failed to load amount font', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 4, // Higher quality
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('opay-receipt.pdf');
    }
  };

  const handleDownload = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `OPay-Receipt-${receiptData.transactionNo.slice(-8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleExportSettings = () => {
    const settings = {
      receiptData,
      styles,
      customLogos,
      version: 1
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `opay-receipt-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const settings = JSON.parse(content);

        if (settings.receiptData) setReceiptData(settings.receiptData);
        if (settings.styles) setStyles(prev => ({ ...prev, ...settings.styles }));
        if (settings.customLogos) setCustomLogos(settings.customLogos);

        alert('Settings imported successfully!');
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Invalid file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleReset = () => {
    setReceiptData(defaultReceipt);
    setStyles(defaultStyles);
    setCustomLogos(defaultCustomLogos);
    setSelectedLogoId(null);
  };



  return (
    <div className="min-h-screen py-6 px-3 flex flex-col items-center w-full" style={{ backgroundColor: '#f0f0f0' }}>
      {/* Developer Splash */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-white/20 transform animate-in slide-in-from-bottom-8 duration-500">
            <div className="relative h-64 w-full bg-[#00C853]/10 overflow-hidden">
              <img
                src="/usi.png"
                alt="Sheikh Rinks"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <h2 className="text-white text-2xl font-bold tracking-tight">Receipt Generator V2</h2>
              </div>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">Welcome to the elite OPay re-generator.</p>
                <p className="text-gray-800 text-lg font-bold">Proudly developed by <span className="text-[#00C853]">Sheikh Rinks</span> With ❤️</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setShowSplash(false)}
                  className="w-full bg-[#00C853] hover:bg-[#00A844] text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-green-200"
                >
                  Enter Workspace
                </Button>
                <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                  <span>Build: V2.0.4-Geek</span>
                  <span>•</span>
                  <span>© 2026 RINKS DEV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 px-4">
          <img
            src="/opay-logo.png"
            alt="OPay"
            style={{ height: '36px', margin: '0 auto 12px' }}
          />
          <h1 className="text-2xl font-bold text-gray-800">Receipt Generator</h1>
          <p className="text-gray-500 mt-1">Create custom OPay transaction receipts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start px-2">
          {/* Controls Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === 'content' ? 'default' : 'outline'}
                onClick={() => handleTabClick('content')}
                className="flex-1"
                style={{ backgroundColor: activeTab === 'content' ? '#00C853' : undefined }}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Content
              </Button>
              <Button
                variant={activeTab === 'styles' ? 'default' : 'outline'}
                onClick={() => handleTabClick('styles')}
                className="flex-1 relative"
                style={{ backgroundColor: activeTab === 'styles' ? '#00C853' : undefined }}
              >
                {!isUnlocked && <Lock className="w-3 h-3 absolute top-1 right-1 text-gray-400" />}
                <Type className="w-4 h-4 mr-2" />
                Styles
              </Button>
              <Button
                variant={activeTab === 'watermarks' ? 'default' : 'outline'}
                onClick={() => handleTabClick('watermarks')}
                className="flex-1 relative"
                style={{ backgroundColor: activeTab === 'watermarks' ? '#00C853' : undefined }}
              >
                {!isUnlocked && <Lock className="w-3 h-3 absolute top-1 right-1 text-gray-400" />}
                <ImageIcon className="w-4 h-4 mr-2" />
                Watermarks
              </Button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <Card className="shadow-lg">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-lg">Receipt Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 sm:px-6">
                  {/* Date & Time Tools */}
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                    <Label className="text-xs font-semibold text-gray-700">Date & Time Tools</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => {
                          const now = new Date();
                          // Format: Nov 29th, 2025
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          const day = now.getDate();
                          const suffix = (day: number) => {
                            if (day > 3 && day < 21) return 'th';
                            switch (day % 10) {
                              case 1: return "st";
                              case 2: return "nd";
                              case 3: return "rd";
                              default: return "th";
                            }
                          };
                          const dateStr = `${months[now.getMonth()]} ${day}${suffix(day)}, ${now.getFullYear()}`;

                          // Format: 16:41:00
                          const timeStr = now.toTimeString().split(' ')[0];

                          handleInputChange('date', dateStr);
                          handleInputChange('time', timeStr);
                        }}
                      >
                        Use Current Time
                      </Button>
                      <Input
                        type="datetime-local"
                        className="h-8 text-xs"
                        onChange={(e) => {
                          const d = new Date(e.target.value);
                          if (!isNaN(d.getTime())) {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const day = d.getDate();
                            const suffix = (day: number) => {
                              if (day > 3 && day < 21) return 'th';
                              switch (day % 10) {
                                case 1: return "st";
                                case 2: return "nd";
                                case 3: return "rd";
                                default: return "th";
                              }
                            };
                            const dateStr = `${months[d.getMonth()]} ${day}${suffix(day)}, ${d.getFullYear()}`;
                            const timeStr = d.toTimeString().split(' ')[0];

                            handleInputChange('date', dateStr);
                            handleInputChange('time', timeStr);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Amount (₦)</Label>
                      <Input
                        value={receiptData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <Input
                        value={receiptData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Input
                        value={receiptData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Time</Label>
                      <Input
                        value={receiptData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Transaction No.</Label>
                    <Input
                      value={receiptData.transactionNo}
                      onChange={(e) => handleInputChange('transactionNo', e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Merchant Name</Label>
                    <Input
                      value={receiptData.merchantName}
                      onChange={(e) => handleInputChange('merchantName', e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Merchant Order No.</Label>
                    <Input
                      value={receiptData.merchantOrderNo}
                      onChange={(e) => handleInputChange('merchantOrderNo', e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Footer Text</Label>
                    <textarea
                      value={receiptData.footerText}
                      onChange={(e) => handleInputChange('footerText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Styles Tab */}
            {activeTab === 'styles' && (
              <Card className="shadow-lg max-h-[600px] overflow-y-auto">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Text Styles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Global Settings */}
                  <div className="space-y-3 p-3 border rounded-lg bg-blue-50">
                    <Label className="font-semibold text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Global Settings
                    </Label>

                    {/* Import/Export Settings */}
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white"
                        onClick={handleExportSettings}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Settings
                      </Button>
                      <div className="relative flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white"
                          onClick={() => document.getElementById('settings-import')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Import Settings
                        </Button>
                        <input
                          id="settings-import"
                          type="file"
                          accept=".json"
                          onChange={handleImportSettings}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Font Settings */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Global Font</Label>
                      <select
                        value={styles.globalFont}
                        onChange={(e) => {
                          const newFont = e.target.value;
                          setStyles(prev => {
                            const newStyles = { ...prev, globalFont: newFont };
                            const textKeys: (keyof ReceiptStyles)[] = ['amount', 'currencySymbol', 'status', 'dateTime', 'labels', 'values', 'transactionNoValue', 'merchantNameValue', 'merchantOrderNoValue', 'footer', 'headerTitle'];

                            textKeys.forEach(key => {
                              if (typeof newStyles[key] === 'object') {
                                (newStyles[key] as TextStyle).fontFamily = newFont;
                              }
                            });

                            return newStyles;
                          });
                        }}
                        className="w-full px-2 py-1.5 border rounded text-sm"
                      >
                        {availableFonts.map((font) => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".ttf,.otf,.woff,.woff2"
                          multiple
                          onChange={handleFontUpload}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Width (px)</Label>
                        <Input
                          type="number"
                          value={styles.receiptWidth}
                          onChange={(e) => updateStyle('receiptWidth', parseInt(e.target.value) || 380)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Height (px)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={styles.receiptHeight === 'auto' ? '' : styles.receiptHeight}
                            placeholder="Auto"
                            disabled={styles.receiptHeight === 'auto'}
                            onChange={(e) => updateStyle('receiptHeight', parseInt(e.target.value) || 'auto')}
                            className="h-8 flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={styles.receiptHeight === 'auto'}
                              onChange={(e) => updateStyle('receiptHeight', e.target.checked ? 'auto' : 600)}
                              className="h-4 w-4"
                            />
                            <span className="text-xs text-gray-500">Auto</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Content Padding (px)</Label>
                        <Input
                          type="number"
                          value={styles.contentPadding}
                          onChange={(e) => updateStyle('contentPadding', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Border Padding (px)</Label>
                        <Input
                          type="number"
                          value={styles.borderPadding}
                          onChange={(e) => updateStyle('borderPadding', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Header Logo Size: {styles.headerLogoHeight}px</Label>
                        <Slider
                          value={[styles.headerLogoHeight]}
                          onValueChange={([v]) => updateStyle('headerLogoHeight', v)}
                          min={15}
                          max={100}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Header Extra Padding: {styles.headerPaddingX}px</Label>
                        <Slider
                          value={[styles.headerPaddingX]}
                          onValueChange={([v]) => updateStyle('headerPaddingX', v)}
                          min={0}
                          max={50}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Border Size (Height): {styles.borderSize}px</Label>
                      <Slider
                        value={[styles.borderSize]}
                        onValueChange={([v]) => updateStyle('borderSize', v)}
                        min={5}
                        max={40}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Border Quantity (Roundness): {styles.borderQuantity}</Label>
                      <Slider
                        value={[styles.borderQuantity]}
                        onValueChange={([v]) => updateStyle('borderQuantity', v)}
                        min={10}
                        max={60}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Scallop Stretch (Oval Effect): {styles.borderStretch || 1}</Label>
                      <Slider
                        value={[styles.borderStretch || 1]}
                        onValueChange={([v]) => updateStyle('borderStretch', v)}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Border Color (Dots)</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={styles.borderColor}
                          onChange={(e) => updateStyle('borderColor', e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={styles.borderColor}
                          onChange={(e) => updateStyle('borderColor', e.target.value)}
                          className="flex-1 h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Dashed Line Thickness</Label>
                        <Input
                          type="number"
                          value={styles.dashedLineThickness}
                          onChange={(e) => updateStyle('dashedLineThickness', parseFloat(e.target.value) || 1)}
                          className="h-8"
                          step={0.5}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Dashed Line Spacing</Label>
                        <Input
                          type="number"
                          value={styles.dashedLineSpacing}
                          onChange={(e) => updateStyle('dashedLineSpacing', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Background Watermark Opacity: {(styles.watermarkOpacity * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[styles.watermarkOpacity * 100]}
                        onValueChange={([v]) => updateStyle('watermarkOpacity', v / 100)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Top Border Offset: {styles.topBorderOffset}px</Label>
                        <Slider
                          value={[styles.topBorderOffset]}
                          onValueChange={([v]) => updateStyle('topBorderOffset', v)}
                          min={-styles.borderSize}
                          max={styles.borderSize}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Bottom Border Offset: {styles.bottomBorderOffset}px</Label>
                        <Slider
                          value={[styles.bottomBorderOffset]}
                          onValueChange={([v]) => updateStyle('bottomBorderOffset', v)}
                          min={-styles.borderSize}
                          max={styles.borderSize}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded border border-dashed border-gray-300">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-gray-700">Custom Amount Font</Label>
                      <p className="text-[10px] text-gray-500">Applies to Amount & Symbol</p>
                    </div>
                    <Input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleAmountFontUpload}
                      className="text-xs h-8 w-40"
                    />
                  </div>

                  <TextStyleEditor
                    label="Amount"
                    style={styles.amount}
                    onChange={(s) => updateStyle('amount', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Currency Symbol (₦)"
                    style={styles.currencySymbol}
                    onChange={(s) => updateStyle('currencySymbol', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Transaction Receipt Text"
                    style={styles.headerTitle}
                    onChange={(s) => updateStyle('headerTitle', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Status"
                    style={styles.status}
                    onChange={(s) => updateStyle('status', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Date & Time"
                    style={styles.dateTime}
                    onChange={(s) => updateStyle('dateTime', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Labels"
                    style={styles.labels}
                    onChange={(s) => updateStyle('labels', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Values (General)"
                    style={styles.values}
                    onChange={(s) => updateStyle('values', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Value: Transaction No"
                    style={styles.transactionNoValue}
                    onChange={(s) => updateStyle('transactionNoValue', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Value: Merchant Name"
                    style={styles.merchantNameValue}
                    onChange={(s) => updateStyle('merchantNameValue', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Value: Merchant Order No"
                    style={styles.merchantOrderNoValue}
                    onChange={(s) => updateStyle('merchantOrderNoValue', s)}
                    fonts={availableFonts}
                  />
                  <TextStyleEditor
                    label="Footer"
                    style={styles.footer}
                    onChange={(s) => updateStyle('footer', s)}
                    fonts={availableFonts}
                  />

                </CardContent>
              </Card>
            )}

            {/* Watermarks Tab */}
            {activeTab === 'watermarks' && (
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Custom Watermarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsAddingWatermark(!isAddingWatermark)}
                      variant={isAddingWatermark ? 'default' : 'outline'}
                      className="flex-1"
                      style={{ backgroundColor: isAddingWatermark ? '#00C853' : undefined }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isAddingWatermark ? 'Click on Receipt' : 'Add Watermark'}
                    </Button>
                  </div>



                  <div>
                    <Label className="text-xs text-gray-500">Global Opacity (All Custom Watermarks): {(styles.customWatermarkOpacity * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[styles.customWatermarkOpacity * 100]}
                      onValueChange={([v]) => updateStyle('customWatermarkOpacity', v / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                  </div>

                  {selectedLogo ? (
                    <div className="space-y-3 p-3 border rounded-lg bg-green-50">
                      <div className="flex justify-between items-center">
                        <Label className="font-semibold text-sm flex items-center gap-2">
                          <Move className="w-4 h-4" />
                          Selected Watermark
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLogo(selectedLogo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Opacity: {(selectedLogo.opacity * 100).toFixed(0)}%</Label>
                          <Slider
                            value={[selectedLogo.opacity * 100]}
                            onValueChange={([v]) => updateLogo(selectedLogo.id, { opacity: v / 100 })}
                            min={5}
                            max={100}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Size: {selectedLogo.size}px</Label>
                          <Slider
                            value={[selectedLogo.size]}
                            onValueChange={([v]) => updateLogo(selectedLogo.id, { size: v })}
                            min={20}
                            max={150}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Rotation: {selectedLogo.rotation || 0}°</Label>
                          <Slider
                            value={[selectedLogo.rotation || 0]}
                            onValueChange={([v]) => updateLogo(selectedLogo.id, { rotation: v })}
                            min={0}
                            max={360}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <button
                            onClick={() => updateLogo(selectedLogo.id, { inverted: !selectedLogo.inverted })}
                            className={`text-xs px-2 py-1.5 rounded border transition-colors ${selectedLogo.inverted ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                          >
                            {selectedLogo.inverted ? 'White (Inverted)' : 'Grayscale (Default)'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Position (%)</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-400">X</span>
                            <Input
                              type="number"
                              value={selectedLogo.x.toFixed(1)}
                              onChange={(e) => updateLogo(selectedLogo.id, { x: parseFloat(e.target.value) })}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-400">Y</span>
                            <Input
                              type="number"
                              value={selectedLogo.y.toFixed(1)}
                              onChange={(e) => updateLogo(selectedLogo.id, { y: parseFloat(e.target.value) })}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedLogoId(null)}>
                        Deselect
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                      {customLogos.length === 0 ? 'No custom watermarks added' : 'Click a watermark to edit'}
                    </div>
                  )}

                  {customLogos.length > 0 && !selectedLogo && (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">All Watermarks</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {customLogos.map(l => (
                          <div key={l.id} className="text-xs p-2 border rounded hover:bg-gray-50 cursor-pointer flex justify-between" onClick={() => setSelectedLogoId(l.id)}>
                            <span>Logo at {l.x.toFixed(0)}%, {l.y.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  <Button
                    onClick={() => setCustomLogos([])}
                    variant="outline"
                    className="w-full"
                    disabled={customLogos.length === 0}
                  >
                    Clear All Watermarks
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownload}
                className="w-full text-white"
                style={{ backgroundColor: '#00C853' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              {isUnlocked && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="flex-1 border-[#00C853] text-[#00C853] hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-gray-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-3 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Preview {isAddingWatermark && <span className="text-amber-600 text-sm">- Click to place watermark</span>}
            </h2>
            <div className="w-full overflow-x-hidden flex justify-center">
              <div
                className="p-8 rounded-xl shadow-inner transition-transform duration-200 origin-top"
                style={{
                  backgroundColor: '#d0d0d0',
                  transform: `scale(${scale})`,
                }}
              >
                <div ref={receiptRef} className="inline-block shadow-xl">
                  <ReceiptComponent
                    data={receiptData}
                    styles={styles}
                    customLogos={customLogos}
                    onBackgroundClick={handleBackgroundClick}
                    isAddingWatermark={isAddingWatermark}
                    onUpdateLogo={updateLogo}
                    onSelectLogo={(id) => {
                      setSelectedLogoId(id);
                      setActiveTab('watermarks');
                    }}
                    selectedLogoId={selectedLogoId}
                    logoSrcs={logoSrcs}
                    onDataChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">
              The receipt will be downloaded as a high-quality PNG image
            </p>
            <p className="text-green-600 text-xs mt-2">
              ✓ All changes are automatically saved
            </p>
          </div>
        </div>
        <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter PIN to Unlock</DialogTitle>
              <DialogDescription>
                This area is restricted. Please enter the PIN to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPinDialog(false)}>Cancel</Button>
              <Button onClick={handleUnlock} className="bg-[#00C853] hover:bg-[#00A844]">Unlock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
