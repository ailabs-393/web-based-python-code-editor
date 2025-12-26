export interface FileItem {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
}

export interface FileState {
  files: FileItem[];
  activeFileId: string | null;
  openFileIds: string[];
}
