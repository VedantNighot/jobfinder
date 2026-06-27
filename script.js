const queryInput = document.getElementById("job-input");
const countryInput = document.getElementById("country-input");
const resultContainer = document.getElementById("results");
let query = '';
let country = '';

queryInput.addEventListener('input', (e) => {
    query = e.target.value;
});

countryInput.addEventListener('input', (e) => {
    country = e.target.value;
});

const options = {
    method: 'GET',
	headers: {
        'x-rapidapi-key': '3b2fc41aa8msh2f0214baf53b5d5p1a71c2jsncd85380a21c1',
		'x-rapidapi-host': 'jsearch.p.rapidapi.com',
		'Content-Type': 'application/json'
	}
};

const placeholderLogo =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
            <rect width="120" height="120" rx="24" fill="#e5e7eb"/>
            <path d="M34 78V42h16l10 16 10-16h16v36H74V58L60 78 46 58v20H34z" fill="#94a3b8"/>
        </svg>
    `);

const truncateText = (text, limit = 180) => {
    if (!text) {
        return 'No description available.';
    }

    return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const createJobCard = (job) => {
    const jobElement = document.createElement('div');
    jobElement.classList.add('job');

    const logo = document.createElement('img');
    logo.classList.add('company-logo');
    logo.src = job.employer_logo || placeholderLogo;
    logo.alt = `${job.employer_name || 'Company'} logo`;
    logo.loading = 'lazy';
    logo.addEventListener('error', () => {
        logo.src = placeholderLogo;
    });

    const title = document.createElement('h2');
    title.textContent = job.job_title || 'Untitled role';

    const company = document.createElement('p');
    company.innerHTML = `<strong>Company:</strong> ${job.employer_name || 'Unknown'}`;

    const location = document.createElement('p');
    location.innerHTML = `<strong>Location:</strong> ${job.job_city || 'N/A'}, ${job.job_country || 'N/A'}`;

    const posted = document.createElement('p');
    posted.innerHTML = `<strong>Date Posted:</strong> ${job.job_posted_at_datetime_utc || 'N/A'}`;

    const description = document.createElement('p');
    description.classList.add('job-description');
    description.textContent = truncateText(job.job_description, 180);
    description.dataset.fullDescription = job.job_description || 'No description available.';
    description.dataset.shortDescription = description.textContent;
    description.dataset.expanded = 'false';

    const readMoreButton = document.createElement('button');
    readMoreButton.type = 'button';
    readMoreButton.classList.add('read-more-button');
    readMoreButton.textContent = 'Read more';

    readMoreButton.addEventListener('click', () => {
        const expanded = description.dataset.expanded === 'true';
        description.dataset.expanded = expanded ? 'false' : 'true';
        description.textContent = expanded
            ? description.dataset.shortDescription
            : description.dataset.fullDescription;
        readMoreButton.textContent = expanded ? 'Read more' : 'Show less';
    });

    const link = document.createElement('a');
    link.href = job.job_apply_link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Apply Now';

    jobElement.append(logo, title, company, location, posted, description, readMoreButton, link);
    return jobElement;
};

const fetchJobData = async () => {
    const url = `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(query)}&num_pages=1&country=${encodeURIComponent(country)}&date_posted=all`;
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const jobs = result?.data?.jobs || [];
        resultContainer.innerHTML = '';

        if (!jobs.length) {
            resultContainer.innerHTML = '<p class="no-results">No jobs found. Try another search.</p>';
            return;
        }

        for (let i = 0; i < jobs.length; i++) {
            resultContainer.appendChild(createJobCard(jobs[i]));
        }
    } catch (error) {
        console.error(error);
        resultContainer.innerHTML = '<p class="no-results">Something went wrong while loading jobs.</p>';
    }
}