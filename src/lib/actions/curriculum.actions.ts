'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface CurriculumTopic {
  id: string;
  groupId: string;
  title: string;
  description: string;
  order: number;
  content: string;
}

export interface CurriculumGroup {
  id: string;
  name: string;
  topics: CurriculumTopic[];
}

export async function getCurriculumData(): Promise<CurriculumGroup[]> {
  const contentDir = path.join(process.cwd(), 'src/lib/data/curriculum_content');
  
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const groups: CurriculumGroup[] = [];
  
  // Read directories inside curriculum_content
  const dirs = fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const dir of dirs) {
    const groupId = dir.name;
    const groupPath = path.join(contentDir, groupId);
    
    // Convert folder name to Display Name
    const groupName = groupId === 'cpp_core' ? 'NHÓM 1: C++ TỪ A ĐẾN Z' 
                    : groupId === 'dsa' ? 'NHÓM 2: CTDL & GIẢI THUẬT'
                    : groupId.toUpperCase();

    const topics: CurriculumTopic[] = [];
    
    const files = fs.readdirSync(groupPath).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(groupPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const { data, content } = matter(fileContent);
      
      topics.push({
        id: file.replace('.md', ''),
        groupId,
        title: data.title || file,
        description: data.description || '',
        order: data.order || 99,
        content: content
      });
    }

    // Sort topics by order
    topics.sort((a, b) => a.order - b.order);

    groups.push({
      id: groupId,
      name: groupName,
      topics
    });
  }

  return groups;
}
