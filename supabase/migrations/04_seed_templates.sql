-- HireFlow AI - Templates Seed Data (04_seed_templates.sql)

INSERT INTO public.templates (name, preview_image_url, json_layout, typography, spacing, color_scheme, supported_sections, is_active)
VALUES
(
    'Modern',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    '{"columns": 1, "headerStyle": "centered", "divider": "thin"}'::jsonb,
    '{"fontFamily": "Inter, sans-serif", "headerSize": "24px", "bodySize": "14px"}'::jsonb,
    '{"marginTop": "20px", "marginBottom": "20px", "sectionGap": "16px"}'::jsonb,
    '{"primary": "#2563EB", "secondary": "#1E40AF", "text": "#1F2937", "background": "#FFFFFF"}'::jsonb,
    ARRAY['personal_info', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    true
),
(
    'Executive',
    'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=600&auto=format&fit=crop&q=80',
    '{"columns": 1, "headerStyle": "left-accent", "divider": "thick"}'::jsonb,
    '{"fontFamily": "Georgia, serif", "headerSize": "26px", "bodySize": "14px"}'::jsonb,
    '{"marginTop": "24px", "marginBottom": "24px", "sectionGap": "20px"}'::jsonb,
    '{"primary": "#0F172A", "secondary": "#334155", "text": "#0F172A", "background": "#FFFFFF"}'::jsonb,
    ARRAY['personal_info', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    true
),
(
    'Minimalist',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    '{"columns": 1, "headerStyle": "minimal", "divider": "none"}'::jsonb,
    '{"fontFamily": "Roboto, sans-serif", "headerSize": "22px", "bodySize": "13px"}'::jsonb,
    '{"marginTop": "16px", "marginBottom": "16px", "sectionGap": "14px"}'::jsonb,
    '{"primary": "#374151", "secondary": "#4B5563", "text": "#111827", "background": "#FFFFFF"}'::jsonb,
    ARRAY['personal_info', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    true
),
(
    'Creative',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    '{"columns": 2, "headerStyle": "split", "divider": "color"}'::jsonb,
    '{"fontFamily": "Outfit, sans-serif", "headerSize": "24px", "bodySize": "14px"}'::jsonb,
    '{"marginTop": "20px", "marginBottom": "20px", "sectionGap": "16px"}'::jsonb,
    '{"primary": "#7C3AED", "secondary": "#6D28D9", "text": "#1F2937", "background": "#FFFFFF"}'::jsonb,
    ARRAY['personal_info', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
    true
)
ON CONFLICT (name) DO UPDATE SET
    preview_image_url = EXCLUDED.preview_image_url,
    json_layout = EXCLUDED.json_layout,
    typography = EXCLUDED.typography,
    spacing = EXCLUDED.spacing,
    color_scheme = EXCLUDED.color_scheme,
    supported_sections = EXCLUDED.supported_sections,
    is_active = EXCLUDED.is_active;
