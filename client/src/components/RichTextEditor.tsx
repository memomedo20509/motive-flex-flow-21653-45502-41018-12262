import { useEditor, EditorContent, Editor, NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  Settings,
  Maximize2,
  Minimize2,
  Upload,
  Globe,
  Pencil,
  LinkIcon as LinkIconLucide,
  Trash2,
  AlertTriangle,
  FileCode,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: attributes => {
          return { style: `width: ${attributes.width}` };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: element => {
          const parent = element.parentElement;
          if (parent?.style.textAlign) return parent.style.textAlign;
          return 'center';
        },
        renderHTML: attributes => {
          return { 'data-alignment': attributes.alignment };
        },
      },
      loading: {
        default: 'lazy',
        renderHTML: () => ({ loading: 'lazy' }),
      },
      decoding: {
        default: 'async',
        renderHTML: () => ({ decoding: 'async' }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes['data-alignment'] || 'center';
    delete HTMLAttributes['data-alignment'];
    
    const figureStyle = {
      left: 'text-align: left; margin-right: auto;',
      center: 'text-align: center; margin-left: auto; margin-right: auto;',
      right: 'text-align: right; margin-left: auto;',
    }[alignment] || 'text-align: center;';

    if (HTMLAttributes.title) {
      return [
        'figure',
        { class: 'image-container', style: figureStyle },
        ['img', { ...HTMLAttributes, loading: 'lazy', decoding: 'async' }],
        ['figcaption', {}, HTMLAttributes.title],
      ] as const;
    }

    return [
      'figure',
      { class: 'image-container', style: figureStyle },
      ['img', { ...HTMLAttributes, loading: 'lazy', decoding: 'async' }],
    ] as const;
  },
  parseHTML() {
    return [
      { tag: 'figure img' },
      { tag: 'img[src]' },
    ];
  },
});

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false,
  children,
  title,
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className={`h-8 w-8 ${isActive ? "bg-muted" : ""}`}
    title={title}
    data-testid={`editor-btn-${title?.replace(/\s+/g, '-').toLowerCase()}`}
  >
    {children}
  </Button>
);

interface ImagePropertiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageAttrs: ImageAttributes;
  onSave: (attrs: ImageAttributes) => void;
  onDelete: () => void;
  onReplace: (file: File) => Promise<string | null>;
}

const ImagePropertiesDialog = ({ open, onOpenChange, imageAttrs, onSave, onDelete, onReplace }: ImagePropertiesDialogProps) => {
  const [alt, setAlt] = useState(imageAttrs.alt || '');
  const [title, setTitle] = useState(imageAttrs.title || '');
  const [width, setWidth] = useState(imageAttrs.width || '100%');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(imageAttrs.alignment || 'center');
  const [currentSrc, setCurrentSrc] = useState(imageAttrs.src || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAlt(imageAttrs.alt || '');
    setTitle(imageAttrs.title || '');
    setWidth(imageAttrs.width || '100%');
    setAlignment(imageAttrs.alignment || 'center');
    setCurrentSrc(imageAttrs.src || '');
    setShowDeleteConfirm(false);
    setShowUrlInput(false);
    setUrlValue('');
  }, [imageAttrs]);

  const handleSave = () => {
    onSave({
      src: currentSrc,
      alt,
      title,
      width,
      alignment,
    });
    onOpenChange(false);
  };

  const handleFileReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploading(true);
    const url = await onReplace(file);
    setIsUploading(false);
    if (url) {
      setCurrentSrc(url);
    }
  };

  const handleUrlReplace = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return;
      }
      setCurrentSrc(trimmed);
      setShowUrlInput(false);
      setUrlValue('');
    } catch {
      return;
    }
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
    setShowDeleteConfirm(false);
  };

  const widthOptions = ['25%', '50%', '75%', '100%'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="image-properties-dialog">
        <DialogHeader>
          <DialogTitle>خصائص الصورة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md border p-3 bg-muted/50 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-medium">الصورة الحالية</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileReplace}
                  data-testid="input-replace-image-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => replaceFileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-replace-image-upload"
                >
                  <Upload className="h-3.5 w-3.5 ml-1.5" />
                  {isUploading ? 'جاري الرفع...' : 'رفع بديلة'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  data-testid="button-replace-image-url"
                >
                  <LinkIconLucide className="h-3.5 w-3.5 ml-1.5" />
                  رابط URL
                </Button>
              </div>
            </div>

            {showUrlInput && (
              <div className="flex gap-2">
                <Input
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                  className="flex-1"
                  data-testid="input-replace-image-url"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlReplace();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUrlReplace}
                  disabled={!urlValue.trim()}
                  data-testid="button-confirm-url-replace"
                >
                  تطبيق
                </Button>
              </div>
            )}

            <div style={{ textAlign: alignment }}>
              <img
                src={currentSrc}
                alt={alt || 'معاينة'}
                style={{ width, maxWidth: '100%', display: 'inline-block' }}
                className="rounded-md"
              />
              {title && <p className="text-xs text-muted-foreground mt-1">{title}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt-text">النص البديل (Alt Text) - مهم للـ SEO</Label>
            <Input
              id="alt-text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="وصف الصورة للقراء ومحركات البحث"
              dir="rtl"
              data-testid="input-image-alt"
            />
            <p className="text-xs text-muted-foreground">
              يساعد محركات البحث على فهم محتوى الصورة
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caption">التسمية التوضيحية (Caption)</Label>
            <Input
              id="caption"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="نص يظهر أسفل الصورة"
              dir="rtl"
              data-testid="input-image-caption"
            />
          </div>

          <div className="space-y-2">
            <Label>حجم الصورة</Label>
            <div className="flex gap-2 flex-wrap">
              {widthOptions.map((w) => (
                <Button
                  key={w}
                  type="button"
                  variant={width === w ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWidth(w)}
                  data-testid={`btn-width-${w.replace('%', '')}`}
                >
                  {w}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>محاذاة الصورة</Label>
            <Select value={alignment} onValueChange={(v) => setAlignment(v as 'left' | 'center' | 'right')}>
              <SelectTrigger data-testid="select-image-alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">يمين</SelectItem>
                <SelectItem value="center">وسط</SelectItem>
                <SelectItem value="left">يسار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              data-testid="button-delete-image"
            >
              <Trash2 className="h-3.5 w-3.5 ml-1.5" />
              حذف الصورة من المقالة
            </Button>
          ) : (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">هل أنت متأكد من حذف الصورة؟</p>
              </div>
              <p className="text-xs text-muted-foreground">
                سيتم إزالة الصورة نهائياً من المقالة ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  data-testid="button-confirm-delete-image"
                >
                  نعم، احذف الصورة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  data-testid="button-cancel-delete-image"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-image-props">
            إلغاء
          </Button>
          <Button type="button" onClick={handleSave} data-testid="btn-save-image-props">
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MenuBar = ({ 
  editor, 
  onImagePropertiesOpen,
  isSourceMode,
  onToggleSourceMode,
}: { 
  editor: Editor | null;
  onImagePropertiesOpen: () => void;
  isSourceMode: boolean;
  onToggleSourceMode: () => void;
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("أدخل رابط URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "يرجى اختيار ملف صورة صالح", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الصورة كبير جداً (الحد الأقصى 10MB)", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    toast({ title: "جاري رفع الصورة..." });

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل في رفع الصورة");
      }

      const { url } = await res.json();
      editor.chain().focus().setImage({ 
        src: url, 
        alt: '',
        title: '',
        width: '100%',
        alignment: 'center',
      } as any).run();
      
      toast({ title: "تم رفع الصورة بنجاح - اضغط عليها لتعديل الخصائص" });
    } catch (error) {
      toast({ title: "فشل في رفع الصورة", variant: "destructive" });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
    }
    e.target.value = "";
  };

  const isImageSelected = editor.isActive('image');

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
      <div className="text-xs text-muted-foreground px-2 hidden sm:block">
        يمكنك لصق الصور مباشرة من الحافظة (Ctrl+V) أو سحبها وإفلاتها في المحرر
      </div>
      <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
      
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="تراجع"
      >
        <Undo className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="إعادة"
      >
        <Redo className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="عنوان رئيسي"
      >
        <Heading1 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="عنوان فرعي"
      >
        <Heading2 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="عنوان ثالث"
      >
        <Heading3 className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="عريض"
      >
        <Bold className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="مائل"
      >
        <Italic className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="تحته خط"
      >
        <UnderlineIcon className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="يتوسطه خط"
      >
        <Strikethrough className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="كود"
      >
        <Code className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="محاذاة لليمين"
      >
        <AlignRight className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="توسيط"
      >
        <AlignCenter className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="محاذاة لليسار"
      >
        <AlignLeft className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="قائمة نقطية"
      >
        <List className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="قائمة مرقمة"
      >
        <ListOrdered className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="اقتباس"
      >
        <Quote className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton onClick={addLink} isActive={editor.isActive("link")} title="رابط">
        <LinkIcon className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={() => fileInputRef.current?.click()} title="صورة">
        <ImageIcon className="h-4 w-4" />
      </MenuButton>
      
      {isImageSelected && !isSourceMode && (
        <MenuButton onClick={onImagePropertiesOpen} title="خصائص الصورة">
          <Settings className="h-4 w-4" />
        </MenuButton>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={onToggleSourceMode}
        isActive={isSourceMode}
        title={isSourceMode ? "المحرر المرئي" : "كود HTML"}
        data-testid="button-toggle-source-mode"
      >
        {isSourceMode ? <Eye className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
      </MenuButton>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
        data-testid="input-image-upload"
      />
    </div>
  );
};

function detectSuperArticle(html: string): boolean {
  if (!html) return false;
  const superPatterns = [
    /style\s*=\s*"[^"]*display\s*:\s*flex/i,
    /style\s*=\s*"[^"]*linear-gradient/i,
    /style\s*=\s*"[^"]*box-shadow/i,
    /style\s*=\s*"[^"]*border-radius\s*:\s*\d+/i,
    /style\s*=\s*"[^"]*background\s*:/i,
    /style\s*=\s*"[^"]*grid-template/i,
  ];
  const matchCount = superPatterns.filter(p => p.test(html)).length;
  return matchCount >= 2;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const { toast } = useToast();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<ImageAttributes>({ src: '' });
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const isUploadingRef = useRef(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);
  const [isSuperArticle, setIsSuperArticle] = useState(false);
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [sourceTab, setSourceTab] = useState<'edit' | 'preview' | 'visual'>('edit');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [visualImageDialogOpen, setVisualImageDialogOpen] = useState(false);
  const [visualSelectedImage, setVisualSelectedImage] = useState<HTMLImageElement | null>(null);
  const [visualSelectedImageAttrs, setVisualSelectedImageAttrs] = useState<ImageAttributes>({ src: '' });
  const initialCheckDone = useRef(false);
  const isSourceModeRef = useRef(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const visualIframeRef = useRef<HTMLIFrameElement>(null);
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const visualSyncRef = useRef<NodeJS.Timeout | null>(null);
  const visualListenersAttached = useRef(false);
  const isVisualEditing = useRef(false);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const visualFileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "يرجى اختيار ملف صورة صالح", variant: "destructive" });
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الصورة كبير جداً (الحد الأقصى 10MB)", variant: "destructive" });
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل في رفع الصورة");
      }

      const { url } = await res.json();
      toast({ title: "تم رفع الصورة بنجاح" });
      return url;
    } catch (error) {
      toast({ title: "فشل في رفع الصورة", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "ابدأ الكتابة...",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none text-right",
        dir: "rtl",
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        if (isUploadingRef.current) {
          toast({ title: "انتظر حتى ينتهي رفع الصورة السابقة" });
          event.preventDefault();
          return true;
        }

        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              event.preventDefault();
              isUploadingRef.current = true;
              uploadImage(file).then(url => {
                if (url && editor) {
                  editor.chain().focus().setImage({ 
                    src: url, 
                    alt: '',
                    width: '100%',
                    alignment: 'center',
                  } as any).run();
                }
              }).finally(() => {
                isUploadingRef.current = false;
              });
              return true;
            }
          }
        }

        const html = clipboardData.getData('text/html');
        if (html) {
          const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            const imgSrc = imgMatch[1];
            if (imgSrc.startsWith('data:image')) {
              event.preventDefault();
              editor?.chain().focus().setImage({ 
                src: imgSrc, 
                alt: '',
                width: '100%',
                alignment: 'center',
              } as any).run();
              toast({ title: "تم إضافة الصورة" });
              return true;
            } else if (imgSrc.startsWith('http')) {
              event.preventDefault();
              editor?.chain().focus().setImage({ 
                src: imgSrc, 
                alt: '',
                width: '100%',
                alignment: 'center',
              } as any).run();
              toast({ title: "تم إضافة الصورة من الرابط" });
              return true;
            }
          }
        }

        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file).then(url => {
              if (url && editor) {
                editor.chain().focus().setImage({ 
                  src: url, 
                  alt: '',
                  width: '100%',
                  alignment: 'center',
                } as any).run();
              }
            });
            return true;
          }
        }
        return false;
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          const resolvedPos = view.state.doc.resolve(pos);
          let imagePos = pos;
          let imageNode = view.state.doc.nodeAt(pos);
          
          if (!imageNode || imageNode.type.name !== 'image') {
            for (let d = resolvedPos.depth; d >= 0; d--) {
              const node = resolvedPos.node(d);
              if (node.type.name === 'image') {
                imagePos = resolvedPos.before(d);
                imageNode = node;
                break;
              }
            }
          }
          
          if (!imageNode) {
            view.state.doc.descendants((node, nodePos) => {
              if (node.type.name === 'image' && node.attrs.src === target.getAttribute('src')) {
                imageNode = node;
                imagePos = nodePos;
                return false;
              }
              return true;
            });
          }
          
          if (imageNode && imageNode.type.name === 'image') {
            const attrs = {
              src: imageNode.attrs.src || '',
              alt: imageNode.attrs.alt || '',
              title: imageNode.attrs.title || '',
              width: imageNode.attrs.width || '100%',
              alignment: (imageNode.attrs.alignment || 'center') as 'left' | 'center' | 'right',
            };
            setSelectedImageAttrs(attrs);
            setSelectedImagePos(imagePos);
            setImageDialogOpen(true);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (!isSourceModeRef.current) {
        onChange(editor.getHTML());
      }
    },
  });

  const handleImagePropertiesSave = useCallback((attrs: ImageAttributes) => {
    if (!editor || selectedImagePos === null) return;

    const { state, view } = editor;
    const node = state.doc.nodeAt(selectedImagePos);
    
    if (node && node.type.name === 'image') {
      const tr = state.tr.setNodeMarkup(selectedImagePos, undefined, {
        ...node.attrs,
        src: attrs.src || node.attrs.src,
        alt: attrs.alt || '',
        title: attrs.title || '',
        width: attrs.width || '100%',
        alignment: attrs.alignment || 'center',
      });
      view.dispatch(tr);
      
      setTimeout(() => {
        editor.chain().focus().run();
      }, 100);
      
      toast({ title: "تم تحديث خصائص الصورة" });
    } else {
      toast({ title: "لم يتم العثور على الصورة", variant: "destructive" });
    }
    
    setSelectedImagePos(null);
  }, [editor, selectedImagePos, toast]);

  const handleImageDelete = useCallback(() => {
    if (!editor || selectedImagePos === null) return;

    const { state, view } = editor;
    const node = state.doc.nodeAt(selectedImagePos);

    if (node && node.type.name === 'image') {
      const tr = state.tr.delete(selectedImagePos, selectedImagePos + node.nodeSize);
      view.dispatch(tr);

      setTimeout(() => {
        editor.chain().focus().run();
      }, 100);

      toast({ title: "تم حذف الصورة من المقالة" });
    } else {
      toast({ title: "لم يتم العثور على الصورة", variant: "destructive" });
    }

    setSelectedImagePos(null);
  }, [editor, selectedImagePos, toast]);

  const openImageProperties = useCallback(() => {
    if (!editor) return;
    
    const { state } = editor;
    const { selection } = state;
    const node = state.doc.nodeAt(selection.from);
    
    if (node?.type.name === 'image') {
      setSelectedImageAttrs({
        src: node.attrs.src || '',
        alt: node.attrs.alt || '',
        title: node.attrs.title || '',
        width: node.attrs.width || '100%',
        alignment: node.attrs.alignment || 'center',
      });
      setImageDialogOpen(true);
    }
  }, [editor]);

  useEffect(() => {
    isSourceModeRef.current = isSourceMode;
  }, [isSourceMode]);

  useEffect(() => {
    if (!initialCheckDone.current && value) {
      const isSuper = detectSuperArticle(value);
      setIsSuperArticle(isSuper);
      if (isSuper) {
        setIsSourceMode(true);
        setHtmlSource(value);
        isSourceModeRef.current = true;
        setSourceTab('visual');
      }
      initialCheckDone.current = true;
    }
  }, [value]);


  useEffect(() => {
    if (editor && !isSourceMode && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isSourceMode]);

  const handleToggleSourceMode = useCallback(() => {
    if (isSourceMode) {
      if (isSuperArticle) {
        setShowSwitchWarning(true);
        return;
      }
      if (editor) {
        editor.commands.setContent(htmlSource);
      }
      setIsSourceMode(false);
    } else {
      const currentHtml = editor ? editor.getHTML() : value;
      setHtmlSource(currentHtml);
      setIsSourceMode(true);
    }
  }, [isSourceMode, editor, htmlSource, isSuperArticle, value]);

  const handleConfirmSwitchToWysiwyg = useCallback(() => {
    if (editor) {
      editor.commands.setContent(htmlSource);
    }
    setIsSourceMode(false);
    setShowSwitchWarning(false);
    toast({ title: "تم التبديل للمحرر المرئي - بعض التنسيقات المتقدمة قد تتأثر", variant: "destructive" });
  }, [editor, htmlSource, toast]);

  const insertHtmlAtCursor = useCallback((tagHtml: string) => {
    const textarea = sourceTextareaRef.current;
    if (!textarea) {
      setHtmlSource(prev => {
        const newHtml = prev + tagHtml;
        onChange(newHtml);
        return newHtml;
      });
      return;
    }
    const currentValue = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    const before = currentValue.substring(0, start);
    const after = currentValue.substring(end);
    const newHtml = before + tagHtml + after;
    setHtmlSource(newHtml);
    onChange(newHtml);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tagHtml.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.scrollTop = scrollTop;
    }, 0);
  }, [onChange]);

  const handleSourceImageUpload = useCallback(async (file: File) => {
    setIsUploadingSource(true);
    const url = await uploadImage(file);
    setIsUploadingSource(false);
    if (url) {
      insertHtmlAtCursor(`<img src="${url}" alt="" style="max-width: 100%; height: auto;" />`);
    }
  }, [uploadImage, insertHtmlAtCursor]);

  const handleSourceImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    insertHtmlAtCursor(`<img src="${imageUrl.trim()}" alt="" style="max-width: 100%; height: auto;" />`);
    setImageUrl('');
    setShowUrlInput(false);
    toast({ title: "تم إضافة الصورة من الرابط" });
  }, [imageUrl, insertHtmlAtCursor, toast]);

  const handleSourceChange = useCallback((newHtml: string) => {
    setHtmlSource(newHtml);
    onChange(newHtml);
    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }
    previewDebounceRef.current = setTimeout(() => {
      setPreviewHtml(newHtml);
    }, 500);
  }, [onChange]);

  useEffect(() => {
    if (sourceTab === 'preview' || sourceTab === 'visual') {
      setPreviewHtml(htmlSource);
    }
    if (sourceTab !== 'visual') {
      visualListenersAttached.current = false;
      isVisualEditing.current = false;
    }
  }, [sourceTab]);

  const handleVisualIframeLoad = useCallback(() => {
    const iframe = visualIframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    visualListenersAttached.current = true;

    const syncFromVisual = () => {
      isVisualEditing.current = true;
      if (visualSyncRef.current) {
        clearTimeout(visualSyncRef.current);
      }
      visualSyncRef.current = setTimeout(() => {
        const body = iframe.contentDocument?.body;
        if (body) {
          const newHtml = body.innerHTML;
          setHtmlSource(newHtml);
          onChange(newHtml);
        }
        setTimeout(() => { isVisualEditing.current = false; }, 100);
      }, 300);
    };

    const handleInput = () => syncFromVisual();
    const handleKeyup = () => syncFromVisual();

    const handlePaste = (e: Event) => {
      const pasteEvent = e as ClipboardEvent;
      const items = pasteEvent.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            pasteEvent.preventDefault();
            setIsUploadingSource(true);
            uploadImage(file).then(url => {
              setIsUploadingSource(false);
              if (url && iframe.contentDocument) {
                const img = iframe.contentDocument.createElement('img');
                img.src = url;
                img.alt = '';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                const selection = iframe.contentDocument.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  range.deleteContents();
                  range.insertNode(img);
                  range.collapse(false);
                } else {
                  iframe.contentDocument.body.appendChild(img);
                }
                syncFromVisual();
              }
            });
            return;
          }
        }
      }
    };

    const handleDrop = (e: Event) => {
      const dropEvent = e as DragEvent;
      const file = dropEvent.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        dropEvent.preventDefault();
        setIsUploadingSource(true);
        uploadImage(file).then(url => {
          setIsUploadingSource(false);
          if (url && iframe.contentDocument) {
            const img = iframe.contentDocument.createElement('img');
            img.src = url;
            img.alt = '';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            iframe.contentDocument.body.appendChild(img);
            syncFromVisual();
          }
        });
      }
    };

    const handleDragover = (e: Event) => {
      const dragEvent = e as DragEvent;
      if (dragEvent.dataTransfer?.types?.includes('Files')) {
        dragEvent.preventDefault();
      }
    };

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        const img = target as HTMLImageElement;
        const parentFigure = img.closest('figure');
        const figcaption = parentFigure?.querySelector('figcaption');
        let alignment: 'left' | 'center' | 'right' = 'center';
        if (parentFigure?.style.textAlign) {
          alignment = parentFigure.style.textAlign as 'left' | 'center' | 'right';
        } else if (img.style.display === 'block') {
          if (img.style.marginLeft === 'auto' && img.style.marginRight === 'auto') alignment = 'center';
          else if (img.style.marginLeft === 'auto') alignment = 'right';
          else if (img.style.marginRight === 'auto') alignment = 'left';
        }
        const width = img.style.width || img.getAttribute('width') || '100%';
        setVisualSelectedImage(img);
        setVisualSelectedImageAttrs({
          src: img.src,
          alt: img.alt || '',
          title: figcaption?.textContent || img.title || '',
          width: width,
          alignment: alignment,
        });
        setVisualImageDialogOpen(true);
      }
    };

    doc.addEventListener('click', handleImageClick);
    doc.body.addEventListener('input', handleInput);
    doc.body.addEventListener('keyup', handleKeyup);
    doc.addEventListener('paste', handlePaste);
    doc.addEventListener('drop', handleDrop);
    doc.addEventListener('dragover', handleDragover);
  }, [onChange, uploadImage]);

  const handleVisualImageUpload = useCallback(async (file: File) => {
    setIsUploadingSource(true);
    const url = await uploadImage(file);
    setIsUploadingSource(false);
    if (url) {
      const iframe = visualIframeRef.current;
      if (iframe?.contentDocument) {
        const img = iframe.contentDocument.createElement('img');
        img.src = url;
        img.alt = '';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        const selection = iframe.contentDocument.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.collapse(false);
        } else {
          iframe.contentDocument.body.appendChild(img);
        }
        const newHtml = iframe.contentDocument.body.innerHTML;
        setHtmlSource(newHtml);
        onChange(newHtml);
      }
    }
  }, [uploadImage, onChange]);

  const syncVisualToHtml = useCallback(() => {
    const iframe = visualIframeRef.current;
    if (iframe?.contentDocument?.body) {
      const newHtml = iframe.contentDocument.body.innerHTML;
      setHtmlSource(newHtml);
      onChange(newHtml);
    }
  }, [onChange]);

  const handleVisualImageSave = useCallback((attrs: ImageAttributes) => {
    if (!visualSelectedImage) return;
    const img = visualSelectedImage;
    const iframe = visualIframeRef.current;
    if (!iframe?.contentDocument) return;

    img.src = attrs.src;
    img.alt = attrs.alt || '';
    img.style.width = attrs.width || '100%';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';

    let figure = img.closest('figure');
    if (!figure && (attrs.title || attrs.alignment !== 'center')) {
      figure = iframe.contentDocument.createElement('figure');
      figure.className = 'image-container';
      img.parentNode?.insertBefore(figure, img);
      figure.appendChild(img);
    }

    if (figure) {
      const align = attrs.alignment || 'center';
      figure.style.textAlign = align;
      if (align === 'center') {
        figure.style.marginLeft = 'auto';
        figure.style.marginRight = 'auto';
      } else if (align === 'left') {
        figure.style.marginLeft = '';
        figure.style.marginRight = 'auto';
      } else {
        figure.style.marginLeft = 'auto';
        figure.style.marginRight = '';
      }

      let figcaption = figure.querySelector('figcaption');
      if (attrs.title) {
        if (!figcaption) {
          figcaption = iframe.contentDocument.createElement('figcaption');
          figcaption.style.cssText = 'text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; font-style: italic;';
          figure.appendChild(figcaption);
        }
        figcaption.textContent = attrs.title;
      } else if (figcaption) {
        figcaption.remove();
      }
    }

    setVisualSelectedImage(null);
    setVisualImageDialogOpen(false);
    syncVisualToHtml();
    toast({ title: "تم حفظ خصائص الصورة" });
  }, [visualSelectedImage, syncVisualToHtml, toast]);

  const handleVisualImageDelete = useCallback(() => {
    if (!visualSelectedImage) return;
    const parentFigure = visualSelectedImage.closest('figure');
    if (parentFigure) {
      parentFigure.remove();
    } else {
      visualSelectedImage.remove();
    }
    setVisualSelectedImage(null);
    setVisualImageDialogOpen(false);
    syncVisualToHtml();
    toast({ title: "تم حذف الصورة" });
  }, [visualSelectedImage, syncVisualToHtml, toast]);

  useEffect(() => {
    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
      if (visualSyncRef.current) {
        clearTimeout(visualSyncRef.current);
      }
      visualListenersAttached.current = false;
      isVisualEditing.current = false;
    };
  }, []);

  return (
    <div className="border rounded-md overflow-hidden bg-background" data-testid="rich-text-editor">
      <MenuBar 
        editor={editor} 
        onImagePropertiesOpen={openImageProperties}
        isSourceMode={isSourceMode}
        onToggleSourceMode={handleToggleSourceMode}
      />

      {isSuperArticle && isSourceMode && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800" data-testid="super-article-warning">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            هذه مقالة سوبر تحتوي على تنسيقات متقدمة (CSS مباشر). يُفضل التعديل في وضع HTML للحفاظ على التنسيق.
          </p>
        </div>
      )}

      {showSwitchWarning && (
        <div className="px-4 py-3 bg-destructive/5 border-b border-destructive/20 space-y-2" data-testid="switch-warning">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">تحذير: التبديل للمحرر المرئي سيفقد التنسيقات المتقدمة</p>
          </div>
          <p className="text-xs text-muted-foreground">
            المحرر المرئي لا يدعم التنسيقات المتقدمة مثل Flexbox وGradients وBox Shadow. التبديل سيزيل هذه التنسيقات نهائياً.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmSwitchToWysiwyg}
              data-testid="button-confirm-switch-wysiwyg"
            >
              متابعة وفقدان التنسيقات
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSwitchWarning(false)}
              data-testid="button-cancel-switch"
            >
              البقاء في وضع HTML
            </Button>
          </div>
        </div>
      )}

      {isSourceMode ? (
        <div>
          <div className="flex items-center border-b gap-1 flex-wrap" data-testid="source-mode-tabs">
            <button
              type="button"
              onClick={() => setSourceTab('edit')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sourceTab === 'edit'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-html-edit"
            >
              <FileCode className="h-3.5 w-3.5 inline-block ml-1.5" />
              تعديل HTML
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('visual')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sourceTab === 'visual'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-visual-edit"
            >
              <Pencil className="h-3.5 w-3.5 inline-block ml-1.5" />
              تعديل مرئي
            </button>
            <button
              type="button"
              onClick={() => setSourceTab('preview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sourceTab === 'preview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-preview"
            >
              <Eye className="h-3.5 w-3.5 inline-block ml-1.5" />
              معاينة
            </button>

            <div className="mr-auto flex items-center gap-1 px-2">
              <input
                type="file"
                ref={sourceFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSourceImageUpload(file);
                  e.target.value = '';
                }}
                data-testid="input-source-image-upload"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => sourceFileInputRef.current?.click()}
                disabled={isUploadingSource}
                data-testid="button-source-upload-image"
              >
                <Upload className="h-3.5 w-3.5 ml-1.5" />
                {isUploadingSource ? 'جاري الرفع...' : 'رفع صورة'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                data-testid="button-source-url-image"
              >
                <Globe className="h-3.5 w-3.5 ml-1.5" />
                صورة من رابط
              </Button>
            </div>
          </div>

          {showUrlInput && (
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b" data-testid="source-url-input-container">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSourceImageUrl(); } }}
                className="flex-1"
                dir="ltr"
                data-testid="input-source-image-url"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSourceImageUrl}
                disabled={!imageUrl.trim()}
                data-testid="button-insert-url-image"
              >
                إدراج
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowUrlInput(false); setImageUrl(''); }}
                data-testid="button-cancel-url-image"
              >
                إلغاء
              </Button>
            </div>
          )}

          {sourceTab === 'edit' && (
            <textarea
              ref={sourceTextareaRef}
              value={htmlSource}
              onChange={(e) => handleSourceChange(e.target.value)}
              onDrop={(e) => {
                const file = e.dataTransfer?.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  e.preventDefault();
                  handleSourceImageUpload(file);
                }
              }}
              onDragOver={(e) => {
                if (e.dataTransfer?.types?.includes('Files')) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                      e.preventDefault();
                      handleSourceImageUpload(file);
                      return;
                    }
                  }
                }
              }}
              className="w-full min-h-[400px] p-4 font-mono text-sm bg-muted/20 text-foreground focus:outline-none resize-y"
              dir="ltr"
              spellCheck={false}
              placeholder="اكتب كود HTML هنا..."
              data-testid="textarea-html-source"
            />
          )}

          {sourceTab === 'visual' && (
            <div className="min-h-[400px]" data-testid="visual-edit-container">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800">
                <Pencil className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  اضغط على أي نص لتعديله مباشرة. التنسيقات والتصميم محفوظة بالكامل.
                </p>
                <input
                  type="file"
                  ref={visualFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVisualImageUpload(file);
                    e.target.value = '';
                  }}
                  data-testid="input-visual-image-upload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mr-auto"
                  onClick={() => visualFileInputRef.current?.click()}
                  disabled={isUploadingSource}
                  data-testid="button-visual-upload-image"
                >
                  <Upload className="h-3.5 w-3.5 ml-1" />
                  {isUploadingSource ? 'جاري الرفع...' : 'إضافة صورة'}
                </Button>
              </div>
              <iframe
                ref={visualIframeRef}
                srcDoc={`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Tajawal', 'Segoe UI', sans-serif; 
    line-height: 1.8; 
    color: #333; 
    padding: 24px;
    direction: rtl;
    font-size: 16px;
    outline: none;
    min-height: 300px;
  }
  body:focus { outline: none; }
  [contenteditable]:focus { outline: none; }
  img { max-width: 100%; height: auto; border-radius: 8px; cursor: pointer; transition: outline 0.15s, box-shadow 0.15s; }
  img:hover { outline: 2px dashed #0d9488; outline-offset: 4px; box-shadow: 0 0 0 1px rgba(13,148,136,0.15); }
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; line-height: 1.4; }
  h1 { font-size: 1.8em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 0.75em 0; }
  ul, ol { padding-right: 1.5em; margin: 0.75em 0; }
  a { color: #0d9488; text-decoration: none; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right; }
  th { background: #f9fafb; font-weight: 600; }
  blockquote { border-right: 4px solid #0d9488; padding: 12px 16px; margin: 1em 0; background: #f0fdfa; }
  strong { font-weight: 700; }
  *:hover { cursor: text; }
</style>
</head>
<body contenteditable="true">${previewHtml}</body>
</html>`}
                onLoad={handleVisualIframeLoad}
                className="w-full min-h-[400px] border-0"
                style={{ height: '600px' }}
                title="تعديل مرئي للمقالة"
                sandbox="allow-same-origin"
                data-testid="visual-edit-iframe"
              />
            </div>
          )}

          {sourceTab === 'preview' && (
            <div className="min-h-[400px] bg-white" data-testid="preview-container">
              <iframe
                ref={previewIframeRef}
                srcDoc={`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Tajawal', 'Segoe UI', sans-serif; 
    line-height: 1.8; 
    color: #333; 
    padding: 24px;
    direction: rtl;
    font-size: 16px;
  }
  img { max-width: 100%; height: auto; border-radius: 8px; }
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; line-height: 1.4; }
  h1 { font-size: 1.8em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 0.75em 0; }
  ul, ol { padding-right: 1.5em; margin: 0.75em 0; }
  a { color: #0d9488; text-decoration: none; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right; }
  th { background: #f9fafb; font-weight: 600; }
  blockquote { border-right: 4px solid #0d9488; padding: 12px 16px; margin: 1em 0; background: #f0fdfa; }
  strong { font-weight: 700; }
</style>
</head>
<body>${previewHtml}</body>
</html>`}
                className="w-full min-h-[400px] border-0"
                style={{ height: '600px' }}
                title="معاينة المقالة"
                sandbox="allow-same-origin"
                data-testid="preview-iframe"
              />
            </div>
          )}
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
      <ImagePropertiesDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        imageAttrs={selectedImageAttrs}
        onSave={handleImagePropertiesSave}
        onDelete={handleImageDelete}
        onReplace={uploadImage}
      />
      <ImagePropertiesDialog
        open={visualImageDialogOpen}
        onOpenChange={(open) => {
          setVisualImageDialogOpen(open);
          if (!open) setVisualSelectedImage(null);
        }}
        imageAttrs={visualSelectedImageAttrs}
        onSave={handleVisualImageSave}
        onDelete={handleVisualImageDelete}
        onReplace={uploadImage}
      />
      <style>{`
        .ProseMirror .image-container {
          margin: 1rem 0;
          max-width: 100%;
        }
        .ProseMirror .image-container img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: box-shadow 0.2s;
        }
        .ProseMirror .image-container img:hover {
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
        }
        .ProseMirror .image-container figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.5rem;
          font-style: italic;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
