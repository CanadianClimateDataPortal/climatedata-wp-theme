/**
 * API Service
 * 
 * This file contains functions for making API requests to the backend.
 */
const ADMIN_AJAX = '/wp-admin/admin-ajax.php';
const CAPTCHA_BASE_URL = 'https://climatedata.ca/site/assets/themes/climate-data-ca/resources/php/securimage/securimage_show.php';

/**
 * Verifies a captcha code
 * 
 * @param captchaCode - The code entered by the user
 * @param namespace - The namespace for the captcha (e.g., 'analyze')
 * @returns Promise that resolves to the verification result
 */
export const verifyCaptcha = async (captchaCode: string, namespace: string = 'analyze'): Promise<{success: boolean}> => {
	const formData = new FormData();
	formData.append('action', 'check_captcha_code');
	formData.append('captcha_code', captchaCode);
	formData.append('namespace', namespace);

	try {
		const response = await fetch(ADMIN_AJAX, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		if (!response.ok) {
			console.error(`Captcha verification failed with status: ${response.status}`);
			return { success: false };
		}

		const data = await response.json();
		return { success: Boolean(data?.valid) };
	} catch (error) {
		console.error('Error verifying captcha:', error);
		return { success: false };
	}
};

/**
 * Get the URL for the captcha image
 */
export const getCaptchaImageUrl = (namespace: string = 'analyze'): string => {
	return `${CAPTCHA_BASE_URL}?namespace=${namespace}`;
};
