import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";
import {
	GalleryAdminList,
	type GalleryAdminItem,
} from "@/components/admin/GalleryAdminList";
import { requireAdmin } from "@/lib/auth/guards";
import { listGalleryImagesAdmin } from "@/lib/db/queries";
import { GALLERY_BUCKET, storagePublicUrl } from "@/lib/storage";
import { Images } from "lucide-react";

export const metadata: Metadata = {
	title: "Gallery Admin",
	robots: { index: false, follow: false },
};

// Área administrativa: sempre dados frescos.
export const dynamic = "force-dynamic";

/** Gestão da galeria de fotos (issues #6/#24). */
export default async function AdminGalleryPage() {
	await requireAdmin();
	const rows = await listGalleryImagesAdmin();

	const items: GalleryAdminItem[] = rows.map((r) => ({
		id: r.id,
		url: storagePublicUrl(GALLERY_BUCKET, r.path),
		path: r.path,
		category: r.category,
		tags: r.tags,
		altEn: r.altEn,
		altPt: r.altPt,
		captionEn: r.captionEn,
		captionPt: r.captionPt,
		width: r.width,
		height: r.height,
		published: r.published,
		createdAt: r.createdAt.toISOString().slice(0, 10),
	}));

	return (
		<>
			<SiteHeader />
			<main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
				<div className="flex items-center gap-3">
					<Images className="h-6 w-6 text-hazard" aria-hidden />
					<h1 className="stencil text-2xl font-bold text-ink">Photo Gallery</h1>
					<Badge variant="hazard">Admin</Badge>
					<div className="ml-auto flex gap-2">
						<Link href="/gallery">
							<Button variant="outline">Public page →</Button>
						</Link>
						<Link href="/admin">
							<Button variant="outline">← Dashboard</Button>
						</Link>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Upload images</CardTitle>
						<span className="ml-auto text-xs text-muted">
							direct to Supabase Storage · bucket “{GALLERY_BUCKET}”
						</span>
					</CardHeader>
					<CardContent>
						<GalleryUploadForm />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Images ({items.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<GalleryAdminList items={items} />
					</CardContent>
				</Card>
			</main>
		</>
	);
}
