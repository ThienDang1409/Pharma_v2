"use client";

import React, { useState, useEffect } from "react";
import ModernBlogForm from "@/app/components/admin/editor-modern/ModernBlogForm";
import { informationApi, blogApi } from "@/lib/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";

export default function ModernAddBlogPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      await apiFetch(
        () => informationApi.getAll(),
        {
          onSuccess: (response) => {
            setCategories(response?.items || []);
          },
        }
      );
    };
    fetchCategories();
  }, []);

  const handleSave = async (formData: any) => {
    console.log("Saving blog data:", formData);
    // Transform formData to match backend expectations if needed
    const payload = {
      ...formData,
      sections: [
        {
          type: "modern",
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          content_en: formData.content_en,
        }
      ]
    };

    // For now, let's just log it. In a real scenario, we'd call blogApi.create(payload)
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="min-h-screen bg-white">
      <ModernBlogForm
        categories={categories}
        onSave={handleSave}
      />
    </div>
  );
}
