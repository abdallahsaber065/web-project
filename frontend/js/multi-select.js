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
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('focus', () => this.showDropdown());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = this.input.value.trim();
                if (!value) return;
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

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideDropdown();
            }
        });

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

        this.filteredItems.forEach(item => {
            if (!this.isSelected(item.id)) {
                html += `
                    <div class="multi-select-option" data-id="${item.id}" data-name="${item.name}">
                        ${item.name}
                    </div>
                `;
            }
        });

        if (query && !this.availableItems.some(item => item.name.toLowerCase() === query.toLowerCase())) {
            html += `
                <div class="multi-select-option create-new" data-name="${query}">
                    ✨ Create "${query}"
                </div>
            `;
        }

        this.dropdown.innerHTML = html || '<div class="multi-select-option" style="color: #999;">No results found</div>';

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

        const inputElement = this.input;
        this.tagsContainer.innerHTML = tagsHTML;
        this.tagsContainer.appendChild(inputElement);

        this.tagsContainer.querySelectorAll('.multi-select-tag-remove').forEach(remove => {
            remove.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(parseInt(remove.dataset.index));
            });
        });
    }

    showDropdown() {
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
        this.selectedItems = items.map(item => {
            if (typeof item === 'string') {
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
