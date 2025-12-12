/**
 * ThreeModelViewer component interfaces
 */

export interface ThreeModelViewerProps {
  modelPath: string;
  modal?: boolean;
  modelValue?: boolean;
  title?: string;
  instructions?: string;
}

export interface ThreeModelViewerEmits {
  (e: "update:modelValue", value: boolean): void;
}
