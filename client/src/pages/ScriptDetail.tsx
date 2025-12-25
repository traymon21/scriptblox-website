import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScriptDetail() {
  const [, params] = useRoute("/script/:slug");
  const [copied, setCopied] = useState(false);

  const scriptQuery = trpc.scripts.detail.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );

  const script = scriptQuery.data;

  const handleCopy = async () => {
    if (script?.content) {
      try {
        await navigator.clipboard.writeText(script.content);
        setCopied(true);
        toast.success("Script disalin ke clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Gagal menyalin script");
      }
    }
  };

  if (scriptQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50 p-4">
        <div className="container mx-auto max-w-4xl text-center py-16">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Script tidak ditemukan</h1>
          <Link href="/">
            <a>
              <Button>Kembali ke Home</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </a>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{script.title}</h1>
          <p className="text-lg text-slate-600 mb-6">{script.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Badge className="bg-blue-100 text-blue-900">{script.language}</Badge>
            <span className="text-sm text-slate-500">{script.views || 0} views</span>
            <span className="text-sm text-slate-500">
              {new Date(script.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        {/* Code Section */}
        <Card className="overflow-hidden border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">{script.language}</CardTitle>
              <CardDescription className="text-slate-300">Script Code</CardDescription>
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="bg-slate-900 text-slate-100 p-6 overflow-x-auto font-mono text-sm leading-relaxed">
              <code>{script.content}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">Language</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-slate-900">{script.language}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-slate-900">{script.views || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-slate-900">
                {new Date(script.createdAt).toLocaleDateString("id-ID")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
