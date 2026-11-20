import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Send,
  Building,
  Briefcase,
  User,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import type { FullCVData } from "@/types/cv";

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: FullCVData;
}

export default function EmailDraftModal({
  isOpen,
  onClose,
  cvData,
}: EmailDraftModalProps) {
  const { t } = useI18n();
  const applicantName = cvData.personalInfo?.fullName || "Irma Iryani";
  const defaultTarget = cvData.cv.targetRole || "Guru Matematika / Kimia";

  const [companyName, setCompanyName] = useState("");
  const [targetPosition, setTargetPosition] = useState(defaultTarget);
  const [recipientName, setRecipientName] = useState("Bapak/Ibu HRD");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  const compLabel = companyName.trim() || t("email_draft.company_fallback", "Perusahaan");

  // Dynamic Subject
  const emailSubject = useMemo(() => {
    if (language === "en") {
      return `Job Application – ${targetPosition} – ${applicantName}`;
    }
    return `Lamaran Pekerjaan – ${targetPosition} – ${applicantName}`;
  }, [language, targetPosition, applicantName]);

  // Dynamic Email Body
  const emailBody = useMemo(() => {
    const phone = cvData.personalInfo?.phone || "";
    const email = cvData.personalInfo?.email || "";
    const portfolioUrl =
      cvData.cv.portfolioUrl ||
      cvData.projects?.[0]?.link ||
      "https://irma-iryani.josapratama.com";

    if (language === "en") {
      return `Dear ${recipientName} & Hiring Team at ${compLabel},

I hope this email finds you well.

My name is ${applicantName}, and I am writing to express my strong interest in the ${targetPosition} position at ${compLabel}. 

With my educational background and professional training, I have developed solid foundational skills, analytical capabilities, and high attention to detail. I am confident that my dedication, rapid adaptability, and commitment to excellence will make a meaningful contribution to your team.

As consideration, I have attached the following documents to this email:
1. Curriculum Vitae (CV)
2. Cover Letter
3. Copy of Academic Degree & Official Transcripts
4. Professional Certifications & Portfolio

You may also review my digital portfolio and project showcase at: ${portfolioUrl}

Thank you very much for your time and consideration. I would welcome the opportunity to discuss my qualifications further in an interview.

Sincerely,

${applicantName}
Phone: ${phone}
Email: ${email}`;
    }

    // Default Bahasa Indonesia
    return `Kepada Yth.
${recipientName} / Tim Rekrutmen
${compLabel}
Di Tempat

Dengan hormat,

Sehubungan dengan informasi lowongan pekerjaan yang dibuka untuk posisi ${targetPosition} di ${compLabel}, melalui surat elektronik ini saya bermaksud mengajukan diri untuk dapat bergabung dan berkontribusi secara profesional pada perusahaan/instansi yang Bapak/Ibu pimpin.

Saya merupakan lulusan ${cvData.educations?.[0]?.degree || "Sarjana"} ${cvData.educations?.[0]?.school ? `dari ${cvData.educations[0].school}` : ""} dengan pemahaman yang baik, ketelitian tinggi, dan kemampuan komunikasi yang komunikatif. Saya memiliki komitmen kerja yang kuat, disiplin, dan siap beradaptasi dengan cepat untuk mendukung kelancaran operasional ${compLabel}.

Bersama email ini, saya lampirkan dokumen pendukung sebagai bahan pertimbangan Bapak/Ibu:
1. Curriculum Vitae (CV) Terbaru
2. Surat Lamaran Pekerjaan
3. Salinan Ijazah dan Transkrip Nilai
4. Salinan Sertifikat Keahlian & Portofolio Kerja

Portofolio digital dan rekam jejak proyek saya juga dapat diakses secara langsung melalui tautan: ${portfolioUrl}

Besar harapan saya untuk diberikan kesempatan mengikuti tahapan wawancara agar dapat menjelaskan kualifikasi dan dedikasi saya secara lebih mendalam. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.

Hormat saya,

${applicantName}
Nomor Telepon: ${phone}
Email: ${email}`;
  }, [language, recipientName, compLabel, applicantName, targetPosition, cvData]);

  // WhatsApp Message
  const waMessage = useMemo(() => {
    const portfolioUrl =
      cvData.cv.portfolioUrl ||
      cvData.projects?.[0]?.link ||
      "https://irma-iryani.josapratama.com";

    return `Selamat pagi/siang Bapak/Ibu ${recipientName} dari ${compLabel}.

Perkenalkan, nama saya *${applicantName}*. 

Saya bermaksud mengirimkan berkas lamaran pekerjaan untuk posisi *${targetPosition}* di ${compLabel}. 

Bersama pesan ini, saya lampirkan Curriculum Vitae (CV) serta dokumen pendukung lainnya. Dokumen portofolio digital saya juga dapat ditinjau melalui link: ${portfolioUrl}

Besar harapan saya untuk dapat diberikan kesempatan wawancara dan berdiskusi lebih lanjut. Terima kasih banyak atas waktu dan perhatian Bapak/Ibu. 🙏`;
  }, [recipientName, compLabel, applicantName, targetPosition, cvData]);

  const copyToClipboard = (text: string, type: "subject" | "email" | "wa") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2000);
    }
    toast.success("Teks berhasil disalin!");
  };

  const openGmail = () => {
    const subjectEnc = encodeURIComponent(emailSubject);
    const bodyEnc = encodeURIComponent(emailBody);
    const toEnc = recipientEmail.trim() ? encodeURIComponent(recipientEmail.trim()) : "";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEnc}&su=${subjectEnc}&body=${bodyEnc}`;
    window.open(gmailUrl, "_blank");
  };

  const openWhatsApp = () => {
    const textEnc = encodeURIComponent(waMessage);
    const waUrl = `https://api.whatsapp.com/send?text=${textEnc}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-xl">
        <DialogHeader className="p-5 pb-3 border-b border-neutral-100 bg-neutral-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                {t("email_draft.modal_title", "Generator Email & WhatsApp Lamaran Kerja")}
              </DialogTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t("email_draft.modal_desc", "Format surat elektronik & pesan pengantar formal siap kirim ke HRD / Perekrut.")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Form Quick Fill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-50/70 border border-neutral-200/80 rounded-xl">
            <div>
              <Label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5 text-neutral-400" />
                {t("email_draft.company_name", "Nama Perusahaan / Sekolah Tujuan")}
              </Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder={t("email_draft.company_ph", "cth: PT Maju Jaya / SMP Angelly")}
                className="text-xs h-8 bg-white border-neutral-200 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                {t("email_draft.target_position", "Posisi yang Dilamar")}
              </Label>
              <Input
                value={targetPosition}
                onChange={e => setTargetPosition(e.target.value)}
                placeholder={t("email_draft.position_ph", "cth: Guru Kimia / Staff Administrasi")}
                className="text-xs h-8 bg-white border-neutral-200 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                {t("email_draft.recipient_name", "Tujuan Surat (Panggilan HRD)")}
              </Label>
              <Input
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder={t("email_draft.recipient_ph", "Bapak/Ibu HRD / Ibu Kepala Sekolah")}
                className="text-xs h-8 bg-white border-neutral-200 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                {t("email_draft.recipient_email", "Email HRD (Opsional untuk Gmail)")}
              </Label>
              <Input
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="recruitment@perusahaan.com"
                className="text-xs h-8 bg-white border-neutral-200 rounded-lg"
              />
            </div>
          </div>

          {/* Format Tabs: Email vs WhatsApp */}
          <Tabs defaultValue="email" className="w-full">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <TabsList className="bg-neutral-100 p-0.5 rounded-lg h-8">
                <TabsTrigger value="email" className="text-xs px-3 h-7 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {t("email_draft.tab_email", "Email Formal")}
                </TabsTrigger>
                <TabsTrigger value="wa" className="text-xs px-3 h-7 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  {t("email_draft.tab_wa", "Pesan WhatsApp")}
                </TabsTrigger>
              </TabsList>

              {/* Language Switch */}
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-neutral-100 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setLanguage("id")}
                  className={`px-2 py-0.5 rounded ${language === "id" ? "bg-white shadow-xs text-neutral-900" : "text-neutral-500"}`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded ${language === "en" ? "bg-white shadow-xs text-neutral-900" : "text-neutral-500"}`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* TAB 1: EMAIL */}
            <TabsContent value="email" className="space-y-3 pt-3">
              {/* Subject */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-neutral-700">{t("email_draft.subject_label", "Subjek Email:")}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(emailSubject, "subject")}
                    className="h-6 px-2 text-[11px] gap-1 text-neutral-600 hover:bg-neutral-100"
                  >
                    {copiedSubject ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSubject ? t("actions.copied", "Tersalin") : t("email_draft.copy_subject", "Salin Subjek")}</span>
                  </Button>
                </div>
                <Input
                  readOnly
                  value={emailSubject}
                  className="text-xs font-mono bg-neutral-50 border-neutral-200 h-8"
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-neutral-700">{t("email_draft.body_label", "Isi Pesan Email (Body):")}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(emailBody, "email")}
                    className="h-6 px-2 text-[11px] gap-1 text-neutral-600 hover:bg-neutral-100"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? t("actions.copied", "Tersalin") : t("email_draft.copy_body", "Salin Isi Email")}</span>
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={emailBody}
                  rows={10}
                  className="text-xs font-sans leading-relaxed bg-neutral-50/70 border-neutral-200 rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${emailSubject}\n\n${emailBody}`, "email")}
                  className="gap-1.5 text-xs h-8 rounded-lg border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t("email_draft.copy_all", "Salin Seluruh Teks Email")}
                </Button>
                <Button
                  size="sm"
                  onClick={openGmail}
                  className="gap-1.5 text-xs h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("email_draft.open_gmail", "Buka di Gmail Web")}
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: WHATSAPP */}
            <TabsContent value="wa" className="space-y-3 pt-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-neutral-700">{t("email_draft.wa_label", "Draf Pesan WhatsApp:")}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(waMessage, "wa")}
                    className="h-6 px-2 text-[11px] gap-1 text-neutral-600 hover:bg-neutral-100"
                  >
                    {copiedWA ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWA ? t("actions.copied", "Tersalin") : t("email_draft.copy_wa", "Salin Pesan WA")}</span>
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={waMessage}
                  rows={8}
                  className="text-xs font-sans leading-relaxed bg-emerald-50/40 border-emerald-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(waMessage, "wa")}
                  className="gap-1.5 text-xs h-8 rounded-lg border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t("email_draft.copy_wa_msg", "Salin Pesan")}
                </Button>
                <Button
                  size="sm"
                  onClick={openWhatsApp}
                  className="gap-1.5 text-xs h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t("email_draft.open_wa", "Buka di WhatsApp Web")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-5">
          <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
            {t("email_draft.attachment_reminder", "Jangan lupa lampirkan file PDF CV & Portofolio sebelum menekan tombol Kirim.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            {t("actions.close", "Tutup")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
