"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Network, TriangleAlert } from "lucide-react"
import ProfileCard from "@/components/dashboard/ProfileCard";
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"

interface Problem {
    difficulty: string;
    tags: string[];
    platform: string;
}

const RADIAN = Math.PI / 180;

const getDifficultyColor = (difficulty: number): string => {
    if (difficulty < 1200) return "#86efac"; // green-300
    if (difficulty < 1400) return "#4ade80"; // green-400
    if (difficulty < 1600) return "#22c55e"; // green-500
    if (difficulty < 1900) return "#a78bfa"; // violet-400
    if (difficulty < 2100) return "#8b5cf6"; // violet-500
    if (difficulty < 2300) return "#fcd34d"; // amber-300
    if (difficulty < 2500) return "#fbbf24"; // amber-400
    if (difficulty < 3000) return "#f87171"; // red-400
    if (difficulty < 3500) return "#ef4444"; // red-500
    return "#d1d5db"; // gray-300
};

const getTagColor = (tagName: string): string => {
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function DashboardPage() {
    const router = useRouter();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

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
                console.error("Failed to fetch problems.", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const ratingsData = useMemo(() => {
        if (problems.length === 0) return [];
        const counts: { [key: number]: number } = {};
        problems.forEach(p => {
            const rating = parseInt(p.difficulty.replace(/\D/g, ''), 10);
            if (!isNaN(rating)) {
                const bucket = Math.floor(rating / 100) * 100;
                counts[bucket] = (counts[bucket] || 0) + 1;
            }
        });

        const dataPoints = Object.entries(counts).map(([bucket, count]) => ({
            name: bucket,
            "Problems Solved": count,
        }));
        
        dataPoints.sort((a, b) => parseInt(a.name) - parseInt(b.name));
        return dataPoints;
    }, [problems]);

    const tagsData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        problems.forEach(p => {
            p.tags.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        
        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
        data.sort((a, b) => b.value - a.value);
        return data;
    }, [problems]);

    const platformData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        problems.forEach(p => {
            counts[p.platform] = (counts[p.platform] || 0) + 1;
        });
        
        const data = Object.entries(counts).map(([name, value]) => ({ name, "Problems": value }));
        data.sort((a, b) => b.Problems - a.Problems);
        return data;
    }, [problems]);

    if (loading) {
        return <div>Loading Dashboard...</div>
    }

    return (
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="grid lg:col-span-1 gap-4 auto-rows-max">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{problems.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platforms Used</CardTitle>
                            <Network className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{[...new Set(problems.map(p => p.platform))].length}</div>
                        </CardContent>
                    </Card>
                </div>
                <ProfileCard />
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={platformData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Bar dataKey="Problems" radius={[4, 4, 0, 0]}>
                                    {platformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getTagColor(entry.name)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:col-span-2 gap-4 auto-rows-max">
                 <Card>
                    <CardHeader>
                        <CardTitle>Problem Ratings</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Problems Solved" radius={[4, 4, 0, 0]}>
                                    {ratingsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getDifficultyColor(parseInt(entry.name))} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Tags Solved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={tagsData} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={50} fill="#8884d8" dataKey="value" >
                                    {tagsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getTagColor(entry.name)} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ maxHeight: '280px', overflowY: 'auto', paddingLeft: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 