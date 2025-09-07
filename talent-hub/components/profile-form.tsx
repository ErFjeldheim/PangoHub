"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

interface ProfileFormProps {
  profile: any
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    title: profile.title || "",
    department: profile.department || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    location: profile.location || "",
    linkedin_url: profile.linkedin_url || "",
    github_url: profile.github_url || "",
    portfolio_url: profile.portfolio_url || "",
    experience_years: profile.experience_years || "",
    hourly_rate: profile.hourly_rate || "",
    availability_status: profile.availability_status || "available",
  })

  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [newSkill, setNewSkill] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          skills,
          experience_years: formData.experience_years ? Number.parseInt(formData.experience_years) : null,
          hourly_rate: formData.hourly_rate ? Number.parseFloat(formData.hourly_rate) : null,
        })
        .eq("id", profile.id)

      if (error) throw error

      toast.success("Profile updated!", {
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your personal and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering, Design, Marketing"
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How people can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin_url}
              onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              placeholder="https://github.com/yourusername"
              value={formData.github_url}
              onChange={(e) => handleInputChange("github_url", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio_url}
              onChange={(e) => handleInputChange("portfolio_url", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your experience and availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => handleInputChange("experience_years", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability_status">Availability</Label>
              <Select
                value={formData.availability_status}
                onValueChange={(value) => handleInputChange("availability_status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  )
}
