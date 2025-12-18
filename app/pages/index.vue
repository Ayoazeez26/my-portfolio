<script setup lang="ts">
import type { IndexCollectionItem } from "@nuxt/content";

const { data: page } = await useAsyncData("index", () => {
  return queryCollection("index").first();
});
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

// Fetch testimonials from Google Sheets API
const { data: testimonials } = await useAsyncData("testimonials", async () => {
  try {
    const response =
      await $fetch<Array<{ quote: string; author: any }>>("/api/testimonials");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    // Fallback to static testimonials from index.yml if API fails
    return page.value?.testimonials || [];
  }
});

// Merge dynamic testimonials with page data
const pageWithTestimonials = computed((): IndexCollectionItem | null => {
  if (!page.value) return null;

  // Ensure testimonials is always an array
  const dynamicTestimonials =
    Array.isArray(testimonials.value) && testimonials.value.length > 0
      ? testimonials.value
      : Array.isArray(page.value.testimonials)
        ? page.value.testimonials
        : [];

  return {
    ...page.value,
    testimonials: dynamicTestimonials,
  } as IndexCollectionItem;
});

useSeoMeta({
  title: page.value?.seo.title || page.value?.title,
  ogTitle: page.value?.seo.title || page.value?.title,
  description: page.value?.seo.description || page.value?.description,
  ogDescription: page.value?.seo.description || page.value?.description,
});
</script>

<template>
  <UPage v-if="page">
    <LandingHero :page />
    <UPageSection
      :ui="{
        container: '!pt-0 lg:grid lg:grid-cols-2 lg:gap-8',
      }"
    >
      <LandingAbout :page />
      <LandingWorkExperience :page />
    </UPageSection>
    <LandingProjects :featured="true" />
    <!-- <LandingBlog :page /> -->
    <LandingTestimonials
      v-if="pageWithTestimonials"
      :page="pageWithTestimonials"
    />
    <!-- <LandingFAQ :page /> -->
  </UPage>
</template>
