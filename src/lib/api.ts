interface ProjectData {
  selectedPages: any;
  images: {
    projectPhotos: string[];
    floorPlan: string[];
    energyCertificate: string[];
    exterior: string[];
    interior: string[];
    layoutPlan: string[];
    logo?: string;
  };
  template: string;
  status: 'draft' | 'published';
  [key: string]: any;
}

export async function createProject(data: ProjectData) {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create project' };
  }
} 