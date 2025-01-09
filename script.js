function resetForm() {
    document.getElementById('benches').value = '';
    document.getElementById('columns').value = '';
    document.getElementById('stream1Name').value = '';
    document.getElementById('stream1Count').value = '';
    document.getElementById('stream2Name').value = '';
    document.getElementById('stream2Count').value = '';
    document.getElementById('seatingPlan').innerHTML = '';
    document.getElementById('institutionName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('examName').value = '';
    document.getElementById('examDate').value = '';
}

// Update the seat generation to include Tailwind classes
function generateSeating() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin">⌛</span> Generating...';
    btn.disabled = true;

    try {
        if (!validateForm()) {
            throw new Error('Validation failed');
        }

        const seatingPlan = document.getElementById('seatingPlan');
        if (!seatingPlan) {
            // If seatingPlan element doesn't exist, create it
            const container = document.getElementById('previewSection');
            if (!container) {
                throw new Error('Preview section not found');
            }
            const newSeatingPlan = document.createElement('div');
            newSeatingPlan.id = 'seatingPlan';
            container.appendChild(newSeatingPlan);
        }

        const benches = parseInt(document.getElementById('benches')?.value || '0');
        const studentsPerBench = parseInt(document.getElementById('columns')?.value || '0');
        const stream1Name = document.getElementById('stream1Name')?.value.trim() || '';
        const stream1Count = parseInt(document.getElementById('stream1Count')?.value || '0');
        const stream2Name = document.getElementById('stream2Name')?.value.trim() || '';
        const stream2Count = parseInt(document.getElementById('stream2Count')?.value || '0');

        if (!benches || !studentsPerBench || !stream1Name || !stream1Count) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        seatingPlan.innerHTML = `
            <h2 class="text-3xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                Seating Arrangement
            </h2>
            <!-- Add configuration summary table -->
            <div class="mb-8">
                <table class="w-full bg-white/50 rounded-lg overflow-hidden">
                    <thead class="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        <tr>
                            <th class="px-6 py-3 text-left">Configuration</th>
                            <th class="px-6 py-3 text-left">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-gray-200">
                            <td class="px-6 py-3 font-medium">Total Benches</td>
                            <td class="px-6 py-3">${benches}</td>
                        </tr>
                        <tr class="border-b border-gray-200">
                            <td class="px-6 py-3 font-medium">Students per Bench</td>
                            <td class="px-6 py-3">${studentsPerBench}</td>
                        </tr>
                        <tr class="border-b border-gray-200">
                            <td class="px-6 py-3 font-medium">${stream1Name} Students</td>
                            <td class="px-6 py-3">${stream1Count}</td>
                        </tr>
                        ${stream2Name ? `
                        <tr class="border-b border-gray-200">
                            <td class="px-6 py-3 font-medium">${stream2Name} Students</td>
                            <td class="px-6 py-3">${stream2Count}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
            <div class="seating-grid space-y-8">
            </div>
        `;

        const seatingGrid = seatingPlan.querySelector('.seating-grid');

        let stream1Counter = 1;
        let stream2Counter = 1;

        for (let i = 0; i < benches; i++) {
            const benchDiv = document.createElement('div');
            benchDiv.className = 'bench bg-white/50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';

            const benchLabel = document.createElement('div');
            benchLabel.className = 'text-lg font-semibold mb-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg inline-block';
            benchLabel.innerHTML = `Bench ${i + 1}`;
            benchDiv.appendChild(benchLabel);

            const benchContainer = document.createElement('div');
            benchContainer.style.display = 'grid';
            benchContainer.style.gridTemplateColumns = `repeat(${studentsPerBench}, 1fr)`;
            benchContainer.style.gap = '1rem';

            for (let j = 0; j < studentsPerBench; j++) {
                const seat = document.createElement('div');
                seat.className = `seat p-4 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md
                    ${stream1Counter <= stream1Count ? 'bg-gradient-to-br from-violet-100 to-indigo-100' : 'bg-gray-50'}`;

                // If stream 2 is not provided, distribute stream 1 students evenly
                if (stream2Name && stream2Count > 0) {
                    // Original logic for two streams
                    if ((j === 0 || j === studentsPerBench - 1) && stream1Counter <= stream1Count) {
                        seat.classList.add('stream1');
                        seat.innerHTML = `Roll No.<br>${stream1Counter}<div class="stream-indicator stream1">${stream1Name}</div>`;
                        stream1Counter++;
                    }
                    else if (j !== 0 && j !== studentsPerBench - 1 && stream2Counter <= stream2Count) {
                        seat.classList.add('stream2');
                        seat.innerHTML = `Roll No.<br>${stream2Counter}<div class="stream-indicator stream2">${stream2Name}</div>`;
                        stream2Counter++;
                    }
                    else {
                        seat.classList.add('empty');
                        seat.innerHTML = 'Empty';
                    }
                } else {
                    // Logic for single stream
                    if (stream1Counter <= stream1Count) {
                        seat.classList.add('stream1');
                        seat.innerHTML = `Roll No.<br>${stream1Counter}<div class="stream-indicator stream1">${stream1Name}</div>`;
                        stream1Counter++;
                    } else {
                        seat.classList.add('empty');
                        seat.innerHTML = 'Empty';
                    }
                }

                benchContainer.appendChild(seat);
            }

            benchDiv.appendChild(benchContainer);
            seatingGrid.appendChild(benchDiv);
        }
        updatePrintTemplate(); // Update print template after generating seating
        navigateStep(2); // This will move to step 3 (print section)

        // Show success notification
        showNotification('Seating plan generated successfully! Ready to print.', 'success');

        // Scroll to print section
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });

        // Highlight print buttons with a pulse animation
        const printButtons = document.querySelectorAll('#step3 button');
        printButtons.forEach(button => {
            button.classList.add('animate-pulse');
            setTimeout(() => button.classList.remove('animate-pulse'), 2000);
        });
    } catch (error) {
        console.error('Error in generateSeating:', error);
        showNotification('Failed to generate seating plan. Please try again.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function updatePrintTemplate() {
    const dynamicHeader = document.getElementById('dynamicHeaderContent');
    const printDate = document.getElementById('printDate');
    dynamicHeader.innerHTML = '';

    // Get all custom sections
    const sections = document.getElementById('headerSections').children;
    let headerHTML = '';

    // Add Logo if enabled
    if (document.getElementById('includeLogo').checked && document.getElementById('logoPreview')) {
        headerHTML += `
            <div class="mb-6">
                <img src="${document.getElementById('logoPreview').src}" 
                    alt="Institution Logo" 
                    class="h-16 mx-auto">
            </div>`;
    }

    // Add custom sections
    Array.from(sections).forEach(section => {
        const title = section.querySelector('input[placeholder="Section Title"]')?.value;
        const content = section.querySelector('input[placeholder="Enter content"]')?.value;
        if (title && content) {
            headerHTML += `
                <div class="mb-2 text-sm">
                    <span class="font-semibold">${title}:</span> ${content}
                </div>`;
        }
    });

    dynamicHeader.innerHTML = headerHTML;
    printDate.textContent = new Date().toLocaleDateString();

    // Make print section visible
    const previewSection = document.getElementById('previewSection');
    previewSection.classList.add('animate__animated', 'animate__fadeIn');
    previewSection.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Print Preview</h3>
                <div class="flex space-x-2">
                    <button onclick="printSeatingPlan()" 
                        class="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        <span>Print</span>
                    </button>
                    <button onclick="generatePDF()" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span>Save PDF</span>
                    </button>
                </div>
            </div>
            <div class="border-2 border-dashed border-gray-200 rounded-lg p-4">
                ${document.getElementById('seatingPlan').innerHTML}
            </div>
        </div>
    `;
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Logo file size should be less than 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('logoPreview');
            if (!preview) {
                const img = document.createElement('img');
                img.id = 'logoPreview';
                img.className = 'h-16 mx-auto mb-4';
                img.src = e.target.result;
                document.getElementById('logoContainer').appendChild(img);
            } else {
                preview.src = e.target.result;
            }
            document.getElementById('logoPreviewContainer').classList.remove('hidden');
            document.getElementById('logoUploadBtn').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    document.getElementById('logoInput').value = '';
    document.getElementById('logoPreviewContainer').classList.add('hidden');
    document.getElementById('logoUploadBtn').classList.remove('hidden');
}

async function generatePDF() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin">⌛</span> Generating PDF...';
    btn.disabled = true;

    try {
        // Create a temporary container for PDF content
        const pdfContent = document.createElement('div');
        pdfContent.className = 'pdf-content bg-white p-8';

        // Add header with logo if enabled
        if (document.getElementById('includeLogo').checked && document.getElementById('logoPreview')) {
            const logoContainer = document.createElement('div');
            logoContainer.className = 'text-center mb-6';
            const logo = document.getElementById('logoPreview').cloneNode(true);
            logo.className = 'h-20 mx-auto';
            logoContainer.appendChild(logo);
            pdfContent.appendChild(logoContainer);
        }

        // Add institution name
        const instName = document.getElementById('institutionName').value;
        if (instName) {
            const header = document.createElement('h1');
            header.className = 'text-2xl font-bold text-center mb-4';
            header.textContent = instName;
            pdfContent.appendChild(header);
        }

        // Add seating plan
        const seatingPlan = document.getElementById('seatingPlan').cloneNode(true);
        seatingPlan.classList.remove('animate-slide-up', 'animate-fade-in');
        pdfContent.appendChild(seatingPlan);

        // Add signature section if enabled
        if (document.getElementById('includeInvigilator').checked) {
            const signatureSection = document.createElement('div');
            signatureSection.className = 'mt-8 pt-4 border-t-2';
            signatureSection.innerHTML = `
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <p class="font-semibold">Invigilator's Signature:</p>
                        <div class="border-b border-gray-400 h-8 mt-2"></div>
                        <p class="text-sm text-gray-500 mt-1">Date: _________________</p>
                    </div>
                    <div>
                        <p class="font-semibold">Supervisor's Signature:</p>
                        <div class="border-b border-gray-400 h-8 mt-2"></div>
                        <p class="text-sm text-gray-500 mt-1">Date: _________________</p>
                    </div>
                </div>
            `;
            pdfContent.appendChild(signatureSection);
        }

        // PDF generation options
        const opt = {
            margin: [10, 10],
            filename: `seating-plan-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        // Generate PDF
        await html2pdf().set(opt).from(pdfContent).save();
        showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Add new function for print preview
function printPreview() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Seating Plan - Print Preview</title>
            <link href="https://cdn.tailwindcss.com" rel="stylesheet">
            <style>
                @media print {
                    body { margin: 0; padding: 20mm; }
                    .no-print { display: none; }
                }
                .page-break { page-break-after: always; }
            </style>
        </head>
        <body class="bg-white">
    `);

    // Add logo if enabled
    if (document.getElementById('includeLogo').checked && document.getElementById('logoPreview')) {
        printWindow.document.write(`
            <div class="text-center mb-6">
                <img src="${document.getElementById('logoPreview').src}" class="h-20 mx-auto">
            </div>
        `);
    }

    // Add institution name
    const instName = document.getElementById('institutionName').value;
    if (instName) {
        printWindow.document.write(`
            <h1 class="text-2xl font-bold text-center mb-4">${instName}</h1>
        `);
    }

    // Add seating plan
    printWindow.document.write(document.getElementById('seatingPlan').innerHTML);

    // Add signature section if enabled
    if (document.getElementById('includeInvigilator').checked) {
        printWindow.document.write(`
            <div class="mt-8 pt-4 border-t-2">
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <p class="font-semibold">Invigilator's Signature:</p>
                        <div class="border-b border-gray-400 h-8 mt-2"></div>
                        <p class="text-sm text-gray-500 mt-1">Date: _________________</p>
                    </div>
                    <div>
                        <p class="font-semibold">Supervisor's Signature:</p>
                        <div class="border-b border-gray-400 h-8 mt-2"></div>
                        <p class="text-sm text-gray-500 mt-1">Date: _________________</p>
                    </div>
                </div>
            </div>
        `);
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Add validation function
function validateForm() {
    const requiredFields = {
        'benches': { label: 'Number of Benches', min: 1 },
        'columns': { label: 'Students per Bench', min: 1 },
        'stream1Name': { label: 'Stream 1 Name', type: 'text' },
        'stream1Count': { label: 'Stream 1 Count', min: 1 }
    };

    for (const [id, config] of Object.entries(requiredFields)) {
        const element = document.getElementById(id);
        const value = element.value.trim();

        if (!value) {
            showNotification(`${config.label} is required`, 'error');
            element.focus();
            return false;
        }

        if (config.min !== undefined) {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < config.min) {
                showNotification(`${config.label} must be at least ${config.min}`, 'error');
                element.focus();
                return false;
            }
        }
    }

    const totalStudents = parseInt(document.getElementById('stream1Count').value) +
        (parseInt(document.getElementById('stream2Count').value) || 0);
    const totalSeats = parseInt(document.getElementById('benches').value) *
        parseInt(document.getElementById('columns').value);

    if (totalStudents > totalSeats) {
        showNotification('Total number of students exceeds available seats', 'error');
        return false;
    }

    return true;
}

function downloadPDF() {
    // Add PDF download functionality using a library like html2pdf.js
    alert('PDF download feature coming soon!');
}

// Add event listeners to print option checkboxes
document.addEventListener('DOMContentLoaded', function () {
    const printOptions = ['includeLogo', 'includeHeader', 'includeFooter', 'includeInvigilator'];
    printOptions.forEach(option => {
        const checkbox = document.getElementById(option);
        if (checkbox) {
            checkbox.addEventListener('change', function () {
                document.body.classList.toggle(option, this.checked);
            });
        }
    });
});

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 z-50 animate__animated animate__fadeInRight ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center space-x-2`;

    // Add icon based on type
    const icon = document.createElement('span');
    icon.innerHTML = type === 'success' ? '✓' : '✕';
    notification.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);

    // Add progress bar
    const progress = document.createElement('div');
    progress.className = 'absolute bottom-0 left-0 h-1 bg-white/30';
    progress.style.width = '100%';
    progress.style.transition = 'width 3s linear';
    notification.appendChild(progress);

    document.body.appendChild(notification);

    // Animate progress bar
    setTimeout(() => {
        progress.style.width = '0%';
    }, 100);

    // Remove notification after delay
    setTimeout(() => {
        notification.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add loading indicators for form submission
document.addEventListener('DOMContentLoaded', function () {
    // Add event listener to generate button
    const generateButton = document.querySelector('[onclick="generateSeating()"]');
    if (generateButton) {
        generateButton.addEventListener('click', async function (e) {
            e.preventDefault();
            if (validateForm()) {
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="animate-spin">⌛</span> Generating...';
                this.disabled = true;

                try {
                    await generateSeating();
                    showNotification('Seating plan generated successfully!', 'success');
                } catch (error) {
                    console.error('Error generating seating plan:', error);
                    showNotification('Failed to generate seating plan', 'error');
                } finally {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }
            }
        });
    }

    // Initialize other event listeners...
    // ...existing event listener initialization code...
});

function addNewSection() {
    const sectionId = Date.now();
    const section = document.createElement('div');
    section.className = 'bg-white/50 backdrop-blur-sm rounded-lg p-6 mb-4 transform transition-all duration-300 hover:shadow-lg';
    section.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <div class="flex-1">
                <input type="text" 
                    placeholder="Section Title" 
                    class="w-full text-lg font-semibold text-gray-700 bg-transparent border-none focus:ring-0 focus:outline-none"
                    onchange="updatePrintTemplate()">
            </div>
            <button onclick="removeSection(${sectionId})" 
                class="group relative p-2 hover:scale-110 transition-transform duration-300"
                title="Remove Section">
                <div class="absolute inset-0 bg-red-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                <svg class="w-5 h-5 text-red-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <input type="text" 
            class="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-violet-200 rounded-lg focus:ring-4 focus:ring-violet-200 focus:border-violet-500 transition-all duration-300"
            placeholder="Enter content"
            onchange="updatePrintTemplate()">
    `;
    section.id = `section-${sectionId}`;
    document.getElementById('headerSections').appendChild(section);
}

function removeSection(sectionId) {
    document.getElementById(`section-${sectionId}`).remove();
    updatePrintTemplate();
}

let currentStep = 1;

function navigateStep(direction) {
    const newStep = currentStep + direction;

    // Validate step bounds (1 to 3)
    if (newStep < 1 || newStep > 3) return;

    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.add('hidden');
    });

    // Remove active state from all buttons
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-violet-100', 'text-violet-600');
    });

    // Show new step content and update button state
    document.getElementById(`step${newStep}`).classList.remove('hidden');
    const activeButton = document.querySelector(`[data-step="${newStep}"]`);
    activeButton.classList.add('active', 'bg-violet-100', 'text-violet-600');

    // Update current step
    currentStep = newStep;

    // Update navigation buttons
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');

    // Previous button state
    prevBtn.disabled = currentStep === 1;
    prevBtn.classList.toggle('opacity-50', currentStep === 1);

    // Next button state
    nextBtn.innerHTML = currentStep === 3 ?
        'Finish <span class="text-xl">→</span>' :
        'Next <span class="text-xl">→</span>';

    // Enable/disable next button based on step validation
    const isStepValid = validateStep(currentStep);
    nextBtn.disabled = currentStep === 3 && !isStepValid;
    nextBtn.classList.toggle('opacity-50', currentStep === 3 && !isStepValid);
}

function validateStep(step) {
    switch (step) {
        case 1:
            // Header details are optional, so always valid
            return true;
        case 2:
            // Check if required fields in step 2 are filled
            const benches = document.getElementById('benches').value.trim();
            const columns = document.getElementById('columns').value.trim();
            const stream1Name = document.getElementById('stream1Name').value.trim();
            const stream1Count = document.getElementById('stream1Count').value.trim();

            if (!benches || !columns || !stream1Name || !stream1Count) {
                return false;
            }

            // Validate numeric values
            if (parseInt(benches) < 1 || parseInt(columns) < 1 || parseInt(stream1Count) < 1) {
                return false;
            }

            return true;
        case 3:
            // Check if seating plan has been generated
            const seatingPlan = document.getElementById('seatingPlan');
            return seatingPlan && seatingPlan.innerHTML.trim() !== '';
        default:
            return false;
    }
}

// Add event listeners when document loads
document.addEventListener('DOMContentLoaded', function () {
    // Step button click handlers
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetStep = parseInt(btn.dataset.step);
            const direction = targetStep - currentStep;
            navigateStep(direction);
        });
    });

    // Next button click handler
    document.getElementById('nextStep').addEventListener('click', () => {
        if (validateStep(currentStep)) {
            navigateStep(1);
        } else {
            showNotification('Please complete all required fields before proceeding', 'error');
        }
    });

    // Previous button click handler
    document.getElementById('prevStep').addEventListener('click', () => {
        navigateStep(-1);
    });

    // Initialize navigation buttons
    updateNavigationButtons();
});

function previewPlan() {
    const previewSection = document.getElementById('previewSection');
    previewSection.innerHTML = document.getElementById('seatingPlan').innerHTML;
    showNotification('Preview updated!', 'success');
}

function exportPlan() {
    const format = document.getElementById('exportFormat').value;
    if (format === 'pdf') {
        generatePDF();
    } else if (format === 'png') {
        // Implementation for PNG export
        html2canvas(document.getElementById('seatingPlan')).then(canvas => {
            const link = document.createElement('a');
            link.download = 'seating-plan.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }
}

// Add validation for each step
function validateStep(step) {
    switch (step) {
        case 1:
            return true; // Logo and header details are optional
        case 2:
            // Check if required fields are filled
            const benches = document.getElementById('benches').value;
            const columns = document.getElementById('columns').value;
            const stream1Name = document.getElementById('stream1Name').value;
            const stream1Count = document.getElementById('stream1Count').value;
            return benches && columns && stream1Name && stream1Count;
        case 3:
            // Check if seating plan is generated
            return document.getElementById('seatingPlan').innerHTML.trim() !== '';
        default:
            return false;
    }
}

// Add event listener for print button
document.querySelector('.print-btn')?.addEventListener('click', printPreview);

// Add new function for printing
function printSeatingPlan() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Seating Plan</title>
            <link href="https://cdn.tailwindcss.com" rel="stylesheet">
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 25mm 20mm;
                    }
                    body { 
                        margin: 0;
                        padding: 0;
                        font-family: 'Times New Roman', serif;
                        line-height: 1.5;
                    }
                    .print-container {
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 20mm;
                        background: white;
                    }
                    .header-section {
                        text-align: center;
                        margin-bottom: 30mm;
                    }
                    .logo-section {
                        margin-bottom: 10mm;
                    }
                    .logo-section img {
                        max-height: 80px;
                        margin: 0 auto;
                    }
                    .institution-name {
                        font-size: 24pt;
                        font-weight: bold;
                        margin: 10mm 0;
                    }
                    .document-title {
                        font-size: 18pt;
                        font-weight: bold;
                        margin: 5mm 0;
                        text-decoration: underline;
                    }
                    .config-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10mm 0;
                    }
                    .config-table th,
                    .config-table td {
                        border: 1px solid black;
                        padding: 8px;
                    }
                    .config-table th {
                        background-color: #f0f0f0;
                    }
                    .seating-grid {
                        page-break-before: auto;
                    }
                    .bench {
                        page-break-inside: avoid;
                        margin-bottom: 10mm;
                    }
                    .signature-section {
                        margin-top: 30mm;
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header-section">
                    ${document.getElementById('logoPreview') ? `
                        <div class="logo-section">
                            <img src="${document.getElementById('logoPreview').src}" 
                                alt="Institution Logo">
                        </div>
                    ` : ''}
                    
                    <div class="institution-name">
                        ${document.getElementById('institutionName').value || 'Institution Name'}
                    </div>
                    
                    <div class="document-title">
                        EXAMINATION SEATING ARRANGEMENT
                    </div>
                    
                    <div class="date-time">
                        Date: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
                    </div>
                </div>

                <!-- Configuration Table -->
                <table class="config-table">
                    <tr>
                        <th colspan="2" style="text-align: center; font-weight: bold;">Configuration Details</th>
                    </tr>
                    ${document.getElementById('seatingPlan').querySelector('table tbody').innerHTML}
                </table>

                <!-- Seating Arrangement -->
                <div class="seating-grid">
                    ${document.querySelector('.seating-grid').innerHTML}
                </div>

                <!-- Signature Section -->
                <div class="signature-section">
                    <table style="width: 100%; margin-top: 20mm;">
                        <tr>
                            <td style="width: 50%; text-align: center;">
                                <div style="border-top: 1px solid black; display: inline-block; padding-top: 5px; min-width: 200px;">
                                    Invigilator's Signature
                                </div>
                            </td>
                            <td style="width: 50%; text-align: center;">
                                <div style="border-top: 1px solid black; display: inline-block; padding-top: 5px; min-width: 200px;">
                                    Supervisor's Signature
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();

    // Wait for resources to load
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// ...existing code...
