/**
 * Multi-Select Autocomplete Component
 */

class MultiSelectAutocomplete {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.selectedItems = [];
        this.availableItems = [];
        this.filteredItems = [];

        this.init();
    }

    init() {
        // ensure container has correct class for styling/positioning
        this.container.classList.add('multi-select-container');
        this.container.innerHTML = `
            <label class="multi-select-label">
                ${this.options.label} ${this.options.required ? '<span class="required">*</span>' : ''}
            </label>
            <div class="multi-select-tags" id="${this.container.id}-tags">
                <input type="text" 
                       class="multi-select-input" 
                       id="${this.container.id}-input"
                       placeholder="${this.options.placeholder || 'Type to search...'}" />
            </div>
            <div class="multi-select-dropdown" id="${this.container.id}-dropdown"></div>
            ${this.options.hint ? `<small>${this.options.hint}</small>` : ''}
        `;

        this.tagsContainer = document.getElementById(`${this.container.id}-tags`);
        this.input = document.getElementById(`${this.container.id}-input`);
        this.dropdown = document.getElementById(`${this.container.id}-dropdown`);

        this.attachEvents();
        this.loadItems();
    }

    attachEvents() {
        // Input events
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('focus', () => this.showDropdown());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = this.input.value.trim();
                if (!value) return;
                // check for exact match
                const exact = this.availableItems.find(item => item.name.toLowerCase() === value.toLowerCase());
                if (exact && !this.isSelected(exact.id, exact.name)) {
                    this.selectedItems.push({ id: exact.id, name: exact.name });
                } else if (!this.isSelected(null, value)) {
                    this.selectedItems.push({ id: null, name: value });
                }
                this.renderTags();
                this.input.value = '';
                this.handleInput();
                return;
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Tags container click to focus input
        this.tagsContainer.addEventListener('click', (e) => {
            if (e.target === this.tagsContainer) {
                this.input.focus();
            }
        });
    }

    async loadItems() {
        try {
            const data = await apiRequest(this.options.endpoint);
            this.availableItems = data.data;
            this.filteredItems = [...this.availableItems];
        } catch (error) {
            console.error('Error loading items:', error);
            this.availableItems = [];
            this.filteredItems = [];
        }
    }

    handleInput() {
        const query = this.input.value.trim().toLowerCase();

        if (query === '') {
            this.filteredItems = [...this.availableItems];
        } else {
            this.filteredItems = this.availableItems.filter(item =>
                item.name.toLowerCase().includes(query)
            );
        }

        this.renderDropdown();
        this.showDropdown();
    }

    renderDropdown() {
        const query = this.input.value.trim();

        let html = '';

        // Show filtered items
        this.filteredItems.forEach(item => {
            if (!this.isSelected(item.id)) {
                html += `
                    <div class="multi-select-option" data-id="${item.id}" data-name="${item.name}">
                        ${item.name}
                    </div>
                `;
            }
        });

        // Show "Create new" option if query doesn't match exactly
        if (query && !this.availableItems.some(item => item.name.toLowerCase() === query.toLowerCase())) {
            html += `
                <div class="multi-select-option create-new" data-name="${query}">
                    ✨ Create "${query}"
                </div>
            `;
        }

        this.dropdown.innerHTML = html || '<div class="multi-select-option" style="color: #999;">No results found</div>';

        // Attach click events
        this.dropdown.querySelectorAll('.multi-select-option').forEach(option => {
            option.addEventListener('click', () => this.selectItem(option));
        });
    }

    selectItem(option) {
        const id = option.dataset.id ? parseInt(option.dataset.id) : null;
        const name = option.dataset.name;

        if (!this.isSelected(id, name)) {
            this.selectedItems.push({ id, name });
            this.renderTags();
            this.input.value = '';
            this.handleInput();
        }
    }

    removeItem(index) {
        this.selectedItems.splice(index, 1);
        this.renderTags();
        this.handleInput();
    }

    renderTags() {
        const tagsHTML = this.selectedItems.map((item, index) => {
            const isNew = item.id === null || item.id === undefined;
            const newClass = isNew ? ' new-item' : '';
            return `
                <span class="multi-select-tag${newClass}">
                    ${item.name}
                    <span class="multi-select-tag-remove" data-index="${index}">×</span>
                </span>
            `;
        }).join('');

        // Keep input at the end
        const inputElement = this.input;
        this.tagsContainer.innerHTML = tagsHTML;
        this.tagsContainer.appendChild(inputElement);

        // Attach remove events
        this.tagsContainer.querySelectorAll('.multi-select-tag-remove').forEach(remove => {
            remove.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(parseInt(remove.dataset.index));
            });
        });
    }

    showDropdown() {
        // Match dropdown width to tags container and show
        try {
            const rect = this.tagsContainer.getBoundingClientRect();
            this.dropdown.style.minWidth = `${rect.width}px`;
        } catch (e) { }
        this.dropdown.classList.add('show');
    }

    hideDropdown() {
        this.dropdown.classList.remove('show');
    }

    isSelected(id, name) {
        if (id !== null && id !== undefined) {
            return this.selectedItems.some(item => item.id == id);
        }
        return this.selectedItems.some(item => item.name === name);
    }

    getSelectedItems() {
        return this.selectedItems;
    }

    getSelectedNames() {
        return this.selectedItems.map(item => item.name);
    }

    getSelectedIds() {
        return this.selectedItems.map(item => item.id).filter(id => id !== null);
    }

    setSelectedItems(items) {
        // items can be array of strings (names) or objects with id and name
        this.selectedItems = items.map(item => {
            if (typeof item === 'string') {
                // Check if item exists in available items
                const existing = this.availableItems.find(a => a.name === item);
                return existing ? { id: existing.id, name: existing.name } : { id: null, name: item };
            }
            return item;
        });
        this.renderTags();
    }

    clear() {
        this.selectedItems = [];
        this.renderTags();
    }
}
