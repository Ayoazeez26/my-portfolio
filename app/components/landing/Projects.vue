<script setup lang="ts">
interface Props {
  /** Project titles to display (e.g., ['Audio Visualizer', 'HSCT', 'Schooldose']) */
  titles?: string[];
  /** Show only featured projects */
  featured?: boolean;
  /** Maximum number of projects to show (default: 3) */
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
  limit: 3,
});

const { data: projects } = await useAsyncData("landing-projects", () => {
  // If specific titles are provided, filter by them
  if (props.titles && props.titles.length > 0) {
    // Get all projects and filter by title
    return queryCollection("projects")
      .all()
      .then((allProjects) => {
        return allProjects
          .filter((project) => {
            return props.titles?.includes(project.title);
          })
          .slice(0, props.limit);
      });
  }

  // If featured is true, filter by featured flag
  if (props.featured) {
    return queryCollection("projects")
      .all()
      .then((allProjects) => {
        return allProjects
          .filter((project) => project.featured === true)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, props.limit);
      });
  }

  // Default: show most recent projects
  return queryCollection("projects")
    .order("date", "DESC")
    .limit(props.limit)
    .all();
});
</script>

<template>
  <UPageSection
    title="Featured Projects"
    description="A selection of projects I've worked on, showcasing my development process."
    :ui="{
      container: '!p-0',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'text-left mt-3 text-sm sm:text-md lg:text-sm text-muted',
    }"
  >
    <div class="space-y-8 mt-8">
      <Motion
        v-for="(project, index) in projects"
        :key="project.title"
        :initial="{ opacity: 0, transform: 'translateY(20px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :description="project.description"
          :to="project.url"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last',
            body: 'flex flex-col justify-between',
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>

          <template #footer>
            <div class="flex flex-col gap-4">
              <div
                v-if="project.tags && project.tags.length > 0"
                class="flex flex-wrap gap-2"
              >
                <UBadge
                  v-for="tag in project.tags"
                  :key="tag"
                  variant="soft"
                  size="sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
              <ULink
                :to="project.url"
                target="_blank"
                class="text-sm text-primary flex items-center gap-2 group-hover:gap-3 transition-all w-fit"
              >
                View Project
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                />
              </ULink>
            </div>
          </template>

          <NuxtImg
            :src="project.image"
            :alt="project.title"
            class="object-cover w-full h-64 lg:h-80 rounded-lg group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </UPageCard>
      </Motion>
    </div>

    <div class="my-8 flex justify-center">
      <UButton to="/projects" color="primary" variant="outline" size="lg">
        View All Projects
        <template #trailing>
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </template>
      </UButton>
    </div>
  </UPageSection>
</template>
