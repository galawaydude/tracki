"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Code2, Search, ArrowUpDown, ChevronDown, ChevronRight, PlusCircle, MoreHorizontal, Edit, Trash2, Star, Download } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Define the type for a single problem
interface Problem {
    id: number;
    title: string;
    platform: string;
    difficulty: string;
    tags: string[];
    logic: string;
    notes: string;
    url: string;
    revisit: boolean;
}

// Helper functions
function getDifficultyColor(difficulty: string): string {
    const lowerCaseDifficulty = difficulty.toLowerCase();
    if (lowerCaseDifficulty.includes("easy")) return "bg-green-100 text-green-700";
    if (lowerCaseDifficulty.includes("medium")) return "bg-yellow-100 text-yellow-700";
    if (lowerCaseDifficulty.includes("hard")) return "bg-red-100 text-red-700";
    const num = parseInt(difficulty.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
        if (num < 1200) return "bg-green-100 text-green-700";
        if (num < 1800) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
}

function getTagColor(tagName: string): string {
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const colorIndex = Math.abs(hash) % 17;
  const tagColors = [
    "bg-red-100 text-red-700", "bg-orange-100 text-orange-700", "bg-amber-100 text-amber-700", "bg-yellow-100 text-yellow-700",
    "bg-lime-100 text-lime-700", "bg-green-100 text-green-700", "bg-emerald-100 text-emerald-700", "bg-teal-100 text-teal-700",
    "bg-cyan-100 text-cyan-700", "bg-sky-100 text-sky-700", "bg-blue-100 text-blue-700", "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700", "bg-purple-100 text-purple-700", "bg-fuchsia-100 text-fuchsia-700", "bg-pink-100 text-pink-700",
    "bg-rose-100 text-rose-700",
  ];
  return tagColors[colorIndex];
}

// Main Component
export default function ProblemListPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [showRevisitOnly, setShowRevisitOnly] = useState(false);

  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [editLogic, setEditLogic] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
        const response = await axios.get(`${apiUrl}/api/problems`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(response.data);
      } catch (err) {
        setError("Failed to fetch problems.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const allPlatforms = [...new Set(problems.map(p => p.platform))];
  const allDifficulties = [...new Set(problems.map(p => p.difficulty))];
  const allTags = [...new Set(problems.flatMap(p => p.tags))];

  const filteredProblems = problems
    .filter(problem => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (problem.logic && problem.logic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (problem.notes && problem.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
      const matchesPlatform = platformFilter === "all" || problem.platform === platformFilter;
      const matchesTag = tagFilter === "all" || problem.tags.includes(tagFilter);
      const matchesRevisit = !showRevisitOnly || problem.revisit;
      return matchesSearch && matchesDifficulty && matchesPlatform && matchesTag && matchesRevisit;
    })
    .sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];

        if (sortBy === 'difficulty') {
            const aNum = parseInt(a.difficulty.replace(/\D/g, ''), 10);
            const bNum = parseInt(b.difficulty.replace(/\D/g, ''), 10);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
            }
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
      const response = await axios.get(`${apiUrl}/api/problems/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'problems.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

    } catch (err) {
      console.error("Failed to export problems.", err);
      setError("Failed to export problems.");
    }
  };

  const handleToggleRevisit = async (problemId: number, currentStatus: boolean) => {
    // Optimistic UI update
    setProblems(problems.map(p => p.id === problemId ? { ...p, revisit: !currentStatus } : p));
    
    const token = localStorage.getItem('access_token');
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
        await axios.put(`${apiUrl}/api/problems/${problemId}/toggle_revisit`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (err) {
        // Revert on error
        setProblems(problems.map(p => p.id === problemId ? { ...p, revisit: currentStatus } : p));
        console.error("Failed to toggle revisit status.", err);
        setError("Failed to update revisit status.");
    }
  };

  const handleDelete = async (problemId: number) => {
    const token = localStorage.getItem('access_token');
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
        await axios.delete(`${apiUrl}/api/problems/${problemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProblems(problems.filter(p => p.id !== problemId));
    } catch (err) {
        console.error("Failed to delete problem.", err);
        setError("Failed to delete problem.");
    }
  };

  const handleEditOpen = (problem: Problem) => {
    setCurrentProblem(problem);
    setEditLogic(problem.logic || '');
    setEditNotes(problem.notes || '');
    setIsEditModalOpen(true);
  };
  
  const handleUpdate = async () => {
    if (!currentProblem) return;
    const token = localStorage.getItem('access_token');
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
        const response = await axios.put(`${apiUrl}/api/problems/${currentProblem.id}`, 
            { logic: editLogic, notes: editNotes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setProblems(problems.map(p => p.id === currentProblem.id ? { ...p, logic: editLogic, notes: editNotes } : p));
        setIsEditModalOpen(false);
    } catch (err) {
        console.error("Failed to update problem.", err);
        setError("Failed to update problem.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
           <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Problem List</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          <Button asChild>
            <Link href="/add-problem">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Problem
            </Link>
          </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="Search problems, tags, logic..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-4">
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                        <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            {allPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            {allDifficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
                <Switch
                    id="revisit-mode"
                    checked={showRevisitOnly}
                    onCheckedChange={setShowRevisitOnly}
                />
                <Label htmlFor="revisit-mode">Only show problems to revisit</Label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%]">
                      <Star className="h-4 w-4" />
                    </TableHead>
                    <TableHead className="w-[20%]">
                      <Button variant="ghost" onClick={() => handleSort('title')}>
                        Problem <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[12%]">
                       <Button variant="ghost" onClick={() => handleSort('difficulty')}>
                        Difficulty <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[20%]">Tags</TableHead>
                    <TableHead className="w-[24%]">Logic</TableHead>
                    <TableHead className="w-[24%]">Notes</TableHead>
                    <TableHead className="w-[5%] text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.length > 0 ? (
                    paginatedProblems.map((problem) => (
                    <TableRow key={problem.id} className="align-top">
                        <TableCell>
                            <Star 
                                className={`h-5 w-5 cursor-pointer ${problem.revisit ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} 
                                onClick={() => handleToggleRevisit(problem.id, problem.revisit)}
                            />
                        </TableCell>
                        <TableCell className="break-words">
                             <HoverCard>
                                  <HoverCardTrigger asChild>
                                      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-600 hover:underline cursor-pointer block truncate">
                            {problem.title}
                          </a>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                      <p className="break-words whitespace-pre-wrap">{problem.title}</p>
                                  </HoverCardContent>
                              </HoverCard>
                          <div className="text-xs text-gray-500">{problem.platform}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {problem.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} className={getTagColor(tag)} variant="outline">{tag}</Badge>
                                ))}
                                {problem.tags.length > 3 && (
                                    <Badge variant="secondary">+{problem.tags.length - 3}</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <p className="truncate text-sm text-gray-700 cursor-pointer">{problem.logic}</p>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-96 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                    <div className="p-4 text-sm text-gray-800 break-words whitespace-pre-wrap">
                                        {problem.logic}
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </TableCell>
                        <TableCell className="max-w-xs">
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <p className="truncate text-sm text-gray-700 cursor-pointer">{problem.notes}</p>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-96 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                    <div className="p-4 text-sm text-gray-800 break-words whitespace-pre-wrap">
                                        {problem.notes}
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                          <span className="sr-only">Open menu</span>
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditOpen(problem)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleToggleRevisit(problem.id, problem.revisit)}>
                                        <Star className="mr-2 h-4 w-4" />
                                        <span>{problem.revisit ? 'Unmark for Revisit' : 'Mark for Revisit'}</span>
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this problem entry.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(problem.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No problems found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(filteredProblems.length, ((currentPage - 1) * itemsPerPage) + 1)} to {Math.min(filteredProblems.length, currentPage * itemsPerPage)} of {filteredProblems.length} problems.
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Problem</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="logic">Logic</Label>
                        <Textarea id="logic" value={editLogic} onChange={(e) => setEditLogic(e.target.value)} className="min-h-[150px]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="min-h-[150px]" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleUpdate}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 