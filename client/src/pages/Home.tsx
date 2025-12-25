import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Code2, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [offset, setOffset] = useState(0);

  const categoriesQuery = trpc.categories.list.useQuery();
  const scriptsQuery = trpc.scripts.list.useQuery({
    categoryId: selectedCategory,
    limit: 12,
    offset,
  });

  const searchQuery_trpc = trpc.scripts.search.useQuery(
    { query: searchQuery, categoryId: selectedCategory, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const scripts = searchQuery.length > 0 ? searchQuery_trpc.data?.scripts || [] : scriptsQuery.data?.scripts || [];
  const isLoading = searchQuery.length > 0 ? searchQuery_trpc.isLoading : scriptsQuery.isLoading;

  const categories = categoriesQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-2xl text-slate-900 hover:opacity-80">
              <Code2 className="w-8 h-8 text-blue-500" />
              ScriptHub
            </a>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin">
                <a>
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </a>
              </Link>
            )}
            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button size="sm">Login</Button>
              </a>
            ) : (
              <div className="text-sm text-slate-600">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Bagikan & Temukan Script Terbaik
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Platform repository script modern untuk menyimpan, mengorganisir, dan membagikan berbagai script dengan mudah.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari script berdasarkan judul, konten, atau tag..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOffset(0);
              }}
              className="pl-12 py-6 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Kategori</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setOffset(0);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === undefined
                      ? "bg-blue-100 text-blue-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Semua Script
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setOffset(0);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {category.icon && <span className="text-lg">{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Scripts Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-16">
                <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Tidak ada script ditemukan</h3>
                <p className="text-slate-600">
                  {searchQuery ? "Coba ubah pencarian Anda" : "Mulai dengan membuat script baru"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scripts.map((script) => (
                  <Link key={script.id} href={`/script/${script.slug}`}>
                    <a className="group">
                      <Card className="h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {script.title}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {script.description ? script.description.substring(0, 80) + "..." : "Tidak ada deskripsi"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 line-clamp-3 overflow-hidden">
                            {script.content.substring(0, 150)}...
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {script.language}
                            </Badge>
                            <span className="text-xs text-slate-500">{script.views || 0} views</span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!searchQuery && scripts.length > 0 && (
              <div className="flex justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setOffset(Math.max(0, offset - 12))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOffset(offset + 12)}
                  disabled={scripts.length < 12}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
