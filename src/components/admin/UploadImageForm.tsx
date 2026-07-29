"use client";

import { useActionState } from "react";
import { uploadReportImage, type ReportsActionState } from "@/app/admin/reports/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * Upload de imagem para o bucket `reports` do Supabase Storage (issues #5/#24).
 * Devolve a URL pública para colar no campo de capa ou no corpo Markdown.
 */
export function UploadImageForm() {
	const [state, formAction, pending] = useActionState<ReportsActionState, FormData>(
		uploadReportImage,
		{},
	);

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="file">Image (PNG/JPEG/WebP/GIF, max 5 MB)</Label>
					<Input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required />
				</div>
				<div>
					<Label htmlFor="filename">Filename (optional, without extension)</Label>
					<Input id="filename" name="filename" placeholder="week-1-mission-report" />
				</div>
			</div>

			{state.error && (
				<p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
					{state.error}
				</p>
			)}
			{state.success && (
				<div className="rounded-sm border border-toxic/40 bg-toxic/10 px-3 py-2 text-sm text-toxic">
					<p className="m-0">{state.success}</p>
					{state.url && (
						<code className="mt-1 block select-all break-all font-mono text-xs text-ink">
							{state.url}
						</code>
					)}
				</div>
			)}

			<div>
				<Button type="submit" variant="outline" pending={pending}>
					{pending ? "Uploading..." : "Upload to Storage"}
				</Button>
			</div>
		</form>
	);
}
