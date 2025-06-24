"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Link, PlusCircle, Trash2 } from 'lucide-react';

interface Profile {
  platform_name: string;
  profile_url: string;
}

interface ProfileData {
  username: string;
  email: string;
  profiles: Profile[];
}

export default function ProfileCard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editableProfiles, setEditableProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
        const res = await fetch(`${apiUrl}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setEditableProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profiles: editableProfiles.filter(p => p.platform_name && p.profile_url) }),
      });

      if (res.ok) {
        const updatedProfile = { ...profileData!, profiles: editableProfiles };
        setProfileData(updatedProfile);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };
  
  const handleAddProfile = () => {
    setEditableProfiles([...editableProfiles, { platform_name: '', profile_url: '' }]);
  };

  const handleRemoveProfile = (index: number) => {
    setEditableProfiles(editableProfiles.filter((_, i) => i !== index));
  };

  const handleProfileChange = (index: number, field: 'platform_name' | 'profile_url', value: string) => {
    const newProfiles = [...editableProfiles];
    newProfiles[index][field] = value;
    setEditableProfiles(newProfiles);
  };


  if (!profileData) {
    return (
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="md:col-span-2 lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Your Profile</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Coding Profiles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editableProfiles.map((profile, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Platform (e.g., LeetCode)"
                    value={profile.platform_name}
                    onChange={(e) => handleProfileChange(index, 'platform_name', e.target.value)}
                  />
                  <Input
                    placeholder="Profile URL"
                    value={profile.profile_url}
                    onChange={(e) => handleProfileChange(index, 'profile_url', e.target.value)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveProfile(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddProfile} className="mt-2">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-muted-foreground" />
            <p className="text-sm font-medium">{profileData.username} ({profileData.email})</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Coding Profiles</h4>
            {profileData.profiles.length > 0 ? (
              <ul className="space-y-1">
                {profileData.profiles.map((profile, index) => (
                  <li key={index} className="flex items-center">
                    <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                      {profile.platform_name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No profiles added yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 