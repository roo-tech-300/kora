import { databases, ID } from "../../appwrite";

type TemplateFiles = {
  template: string;
  template_tilted: string;
  template_flat: string;
};

export const enroll = async (studentId: string, files: TemplateFiles) => {
	try {
		const record = await databases.createRow(
			import.meta.env.VITE_APPWRITE_DATABASE_ID,
			import.meta.env.VITE_APPWRITE_FINGERPRINT_TABLE_ID,
			ID.unique(),
			{
				student: studentId,
				template: files.template,
				template_tilted: files.template_tilted,
				template_flat: files.template_flat,
			}
		);

		return record;
	} catch (error) {
		console.log(`Error enrolling fingerprint: ${error}`);
		throw error;
	}
};

