"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Code2, X, Plus, Loader2 } from "lucide-react"

const tagColors = [
  "bg-red-100 text-red-700 hover:bg-red-200 border-red-200", "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
  "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200", "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
  "bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200", "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
  "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200", "bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200",
  "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200", "bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200",
  "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200", "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
  "bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200", "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 border-fuchsia-200", "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
  "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200", "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
  "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200", "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200",
];

function getTagColor(tagName: string): string {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const colorIndex = Math.abs(hash) % tagColors.length;
  return tagColors[colorIndex];
}

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags: string[];
}

function TagInput({ selectedTags, onTagsChange, existingTags }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputValue.trim()) {
        const filtered = existingTags.filter(
            (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag),
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestionIndex(-1);
        } else {
        setSuggestions([]);
        setShowSuggestions(false);
        }
    }, [inputValue, selectedTags, existingTags]);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
        onTagsChange([...selectedTags, trimmedTag]);
        }
        setInputValue("");
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                addTag(suggestions[activeSuggestionIndex]);
            } else if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

  return (
    <div className="relative">
      <div className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1 items-center">
          {selectedTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className={`${getTagColor(tag)} border`}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder=""
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div key={suggestion}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between ${index === activeSuggestionIndex ? "bg-orange-50" : ""}`}
              onClick={() => addTag(suggestion)}
            >
              <span>{suggestion}</span>
              <Badge variant="secondary" className={`${getTagColor(suggestion)} border text-xs`}>{suggestion}</Badge>
            </div>
          ))}
          {inputValue.trim() && !suggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase()) && (
            <div
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 border-t border-gray-100 flex items-center justify-between ${activeSuggestionIndex === suggestions.length ? "bg-orange-50" : ""}`}
              onClick={() => addTag(inputValue.trim())}
            >
              <span><Plus className="h-3 w-3 inline mr-2" />Create "{inputValue.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Autocomplete Input Component (Upgraded with arrow keys and styling) ---
interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string; // Allow custom classes
}

function AutocompleteInput({ value, onChange, onBlur, suggestions, placeholder, className }: AutocompleteInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const filteredSuggestions = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex > -1 && filteredSuggestions[activeIndex]) {
                onChange(filteredSuggestions[activeIndex]);
                setShowSuggestions(false);
                setActiveIndex(-1);
            } else {
                inputRef.current?.blur();
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
    };
    
    useEffect(() => {
        if (!showSuggestions) {
            setActiveIndex(-1);
        }
    }, [showSuggestions]);

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (!showSuggestions) setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={(e) => {
                    if (onBlur) onBlur(e);
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
                required
            />
            {showSuggestions && value && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={suggestion}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 ${index === activeIndex ? "bg-orange-100" : ""}`}
                            onClick={() => {
                                onChange(suggestion);
                                setShowSuggestions(false);
                            }}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Difficulty Color Helper ---
function getDifficultyColor(difficulty: string): string {
    const lowerCaseDifficulty = difficulty.toLowerCase();
    
    if (lowerCaseDifficulty.includes("easy")) return "text-green-600 font-semibold";
    if (lowerCaseDifficulty.includes("medium")) return "text-yellow-600 font-semibold";
    if (lowerCaseDifficulty.includes("hard")) return "text-red-600 font-semibold";

    const num = parseInt(difficulty.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
        if (num < 1200) return "text-green-600 font-semibold";
        if (num < 1800) return "text-yellow-600 font-semibold";
        return "text-red-600 font-semibold";
    }

    return ""; // Default color
}

// --- Main Form Component (Updated) ---
export default function AddProblemPage() {
    const router = useRouter();
    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    const [platform, setPlatform] = useState("")
    const [difficulty, setDifficulty] = useState("")
    const [logic, setLogic] = useState("")
    const [notes, setNotes] = useState("")
    const [tags, setTags] = useState<string[]>([])
    
    const [existingTags, setExistingTags] = useState<string[]>([]);
    const [existingPlatforms, setExistingPlatforms] = useState<string[]>([]);
    const [existingDifficulties, setExistingDifficulties] = useState<string[]>([]);

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false);
    
    const difficultyColorClass = getDifficultyColor(difficulty);

    useEffect(() => {
        const fetchData = async (endpoint: string, setter: (data: string[]) => void) => {
            const token = localStorage.getItem('access_token');
            // The global layout will handle redirection if the token is missing.
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
                const response = await axios.get(`${apiUrl}/api/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setter(response.data);
            } catch (err) {
                console.error(`Failed to fetch ${endpoint}`, err);
            }
        };

        fetchData("tags", setExistingTags);
        fetchData("platforms", setExistingPlatforms);
        fetchData("difficulties", setExistingDifficulties);
    }, []);

    const handleDifficultyBlur = () => {
        const num = parseInt(difficulty, 10);
        if (!isNaN(num) && String(num) === difficulty) {
            const formatted = Math.floor(num / 100) * 100 + "+";
            setDifficulty(formatted);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true);
        setError("")
        setSuccess("")

        const token = localStorage.getItem('access_token');
        // The global layout will handle redirection if the token is missing.

        const problemData = {
            title,
            url,
            platform,
            difficulty,
            logic,
            notes,
            tags,
        };

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
            await axios.post(`${apiUrl}/api/problems`, problemData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess("Problem added successfully! Redirecting...");
            setTimeout(() => {
                router.push('/problems');
            }, 1000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.msg || "Failed to add problem.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-2xl font-bold text-gray-900">Add New Problem</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Problem Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <AutocompleteInput
                        value={platform}
                        onChange={setPlatform}
                        suggestions={existingPlatforms}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                     <AutocompleteInput
                        value={difficulty}
                        onChange={setDifficulty}
                        onBlur={handleDifficultyBlur}
                        suggestions={existingDifficulties}
                        placeholder="clist ratings"
                        className={difficultyColorClass}
                    />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput selectedTags={tags} onTagsChange={setTags} existingTags={existingTags} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logic">Logic</Label>
              <Textarea id="logic" value={logic} onChange={(e) => setLogic(e.target.value)} rows={5}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={5}/>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {success && <p className="text-sm text-green-600 text-center">{success}</p>}

            <Button type="submit" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Problem"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}