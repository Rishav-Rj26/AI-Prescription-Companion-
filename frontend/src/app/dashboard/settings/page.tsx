"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Globe } from "lucide-react";
import { useCurrentUser, useUpdateSettings } from "@/lib/queries/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const [language, setLanguage] = useState<string>("en");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (user?.preferred_language) {
      setLanguage(user.preferred_language);
    }
  }, [user]);

  const handleSave = () => {
    updateSettings({ preferred_language: language }, {
      onSuccess: () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#192128]">Settings</h1>
        <p className="text-[#4a5866] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#1e4263]" />
            Language Preferences
          </CardTitle>
          <CardDescription>
            Choose your preferred language for medication instructions and chat responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Primary Language
              </label>
              <Select value={language} onValueChange={(v) => setLanguage(v || "en")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-[#4a5866]">
                Medical terms (like medicine names) will remain in English, but explanations and instructions will be translated.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t px-6 py-4">
          <div className="text-sm text-[#14532d] font-medium h-5">
            {showSaved && "Settings saved successfully!"}
          </div>
          <Button onClick={handleSave} disabled={isPending || language === user?.preferred_language}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 border-b py-2">
              <span className="font-medium text-[#4a5866]">Email</span>
              <span className="col-span-2 text-[#192128]">{user?.email}</span>
            </div>
            <div className="grid grid-cols-3 border-b py-2">
              <span className="font-medium text-[#4a5866]">Name</span>
              <span className="col-span-2 text-[#192128]">{user?.full_name || 'Not set'}</span>
            </div>
            <div className="grid grid-cols-3 py-2">
              <span className="font-medium text-[#4a5866]">Member Since</span>
              <span className="col-span-2 text-[#192128]">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
