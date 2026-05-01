import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Card, Cards } from 'fumadocs-ui/components/card';
import type { MDXComponents } from 'mdx/types';
import { McpClientPickerServer } from '@/components/mcp/client-picker-server';
import { BackendPresetPickerServer } from '@/components/mcp/backend-picker-server';
import { ComputeBudget } from '@/components/mcp/compute-budget';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card,
    Cards,
    McpClientPicker: McpClientPickerServer,
    BackendPresetPicker: BackendPresetPickerServer,
    ComputeBudget,
    ...components,
  };
}
