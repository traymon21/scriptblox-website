import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
            <CardDescription>Anda harus login sebagai admin untuk mengakses halaman ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()}>
              <Button className="w-full">Login</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                setLocation("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="scripts">Script</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoriesManager />
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-6">
            <ScriptsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CategoriesManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", color: "#3b82f6", icon: "" });

  const categoriesQuery = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Kategori diperbarui!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Kategori dibuat!");
      }
      setFormData({ name: "", slug: "", description: "", color: "#3b82f6", icon: "" });
      setIsCreating(false);
      setEditingId(null);
      categoriesQuery.refetch();
    } catch (error) {
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Kategori dihapus!");
        categoriesQuery.refetch();
      } catch (error) {
        toast.error("Gagal menghapus kategori");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Kelola Kategori</h2>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Kategori" : "Buat Kategori Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Nama</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama kategori"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Slug (contoh: javascript)"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi kategori"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Warna</label>
                  <Input
                    type="color"
                    value={formData.color || "#3b82f6"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Icon</label>
                  <Input
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Emoji atau icon"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Perbarui" : "Buat"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({ name: "", slug: "", description: "", color: "#3b82f6", icon: "" });
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {categoriesQuery.data?.map((category) => (
          <Card key={category.id}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div>
                    <h3 className="font-bold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      name: category.name,
                      slug: category.slug,
                      description: category.description || "",
                      color: category.color || "#3b82f6",
                      icon: category.icon || "",
                    });
                    setEditingId(category.id);
                    setIsCreating(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScriptsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    language: "javascript",
    categoryId: undefined as number | undefined,
    isPublic: 1,
  });

  const scriptsQuery = trpc.scripts.list.useQuery({ limit: 100 });
  const categoriesQuery = trpc.categories.list.useQuery();
  const createMutation = trpc.scripts.create.useMutation();
  const updateMutation = trpc.scripts.update.useMutation();
  const deleteMutation = trpc.scripts.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Script diperbarui!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Script dibuat!");
      }
      setFormData({
        title: "",
        slug: "",
        description: "",
        content: "",
        language: "javascript",
        categoryId: undefined,
        isPublic: 1,
      });
      setIsCreating(false);
      setEditingId(null);
      scriptsQuery.refetch();
    } catch (error) {
      toast.error("Gagal menyimpan script");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus script ini?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Script dihapus!");
        scriptsQuery.refetch();
      } catch (error) {
        toast.error("Gagal menghapus script");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Kelola Script</h2>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Script
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Script" : "Buat Script Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Judul</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Judul script"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Slug (contoh: my-awesome-script)"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi script"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Konten Script</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Kode script"
                  className="font-mono text-sm"
                  rows={10}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Bahasa</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Kategori</label>
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {categoriesQuery.data?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Perbarui" : "Buat"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({
                      title: "",
                      slug: "",
                      description: "",
                      content: "",
                      language: "javascript",
                      categoryId: undefined,
                      isPublic: 1,
                    });
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {scriptsQuery.data?.scripts.map((script) => (
          <Card key={script.id}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{script.title}</h3>
                <p className="text-sm text-slate-600">{script.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{script.language}</span>
                  <span className="text-xs text-slate-500">{script.views || 0} views</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      title: script.title,
                      slug: script.slug,
                      description: script.description || "",
                      content: script.content,
                      language: script.language || "javascript",
                      categoryId: script.categoryId ? script.categoryId : undefined,
                      isPublic: script.isPublic || 1,
                    });
                    setEditingId(script.id);
                    setIsCreating(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(script.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
