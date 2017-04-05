# Deployment checklist

All of these need to be checked manually, changed and then committed. System will refuse to deploy the site if some of the checkboxes are left empty. To keep things consistent items that were checked and found to be okay developer needs to mark with `x` while items that don't apply need to be marked with `x` and list item prepended with `>`.

- Site specific items:
	- [x] `system_init.xml` file contains all the modules used;
	- [x] Deployment script `group_vars/all` file is configured;
	- [x] Deployment `hosts.txt` file is configured;
	- [x] All the languages site is targeting are configured in `config.php`;
	- [x] Site title is properly defined;
	- [x] No errors or warnings are reported in the log file;
	- [x] Templates for registering and recovering user password are created and selected;
	- [x] PNG images are optimized using `optipng` command;
	- [x] JPEG images are converted from original PNG and optimized using `guetzli` command;
	- [x] SVG images are cleaned and optimized;
	- [x] Site has favicon specified in different sizes (16, 32, 64);
	- [x] All active elements of the site have `:hover` and `:focus` styles defined;
	- [x] Site has copyright;
	- [x] `README.md` file updated appropriately with licensing information;
	- [x] Code in `main.js` targets all pages. Code meant for individual pages is in separate files;
	- [x] Styles are written to target LTR by default with RTL modifications, even on RTL-only sites.
- Contact form:
	- [x] SendGrid API access is configured;
	- [x] Mandrill API access is configured;
	- [x] SMTP credentials are configured and working;
	- [x] Default sender email;
	- [x] Default recipient;
	- [x] Forms have honeypot field;
	- [x] Templates for each form are created and assigned to form;
	- [x] Templates have subject properly defined;
	- [x] Form submits and client/developer receives email.
- Shop:
	- [x] Desired payment method is enabled and configured;
	- [x] Default warehouse is created;
	- [x] Default currency is selected;
	- [x] Contact form template for transaction is created and selected;
	- [x] Shop is not in testing mode.
- Articles:
	- [x] Each article has a title even if it's not used;
