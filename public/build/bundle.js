
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Title.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/components/Title.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let h20;
    	let t0;
    	let h20_class_value;
    	let t1;
    	let h21;
    	let t2;
    	let h21_class_value;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h20 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			h21 = element("h2");
    			t2 = text(/*title*/ ctx[0]);

    			attr_dev(h20, "class", h20_class_value = "" + (null_to_empty(`
        title title-white
        ${/*zoom*/ ctx[4] ? "zoom zoom-text" : ""} 
        ${/*center*/ ctx[1] ? "" : "no-center opacity-0"}
      `) + " svelte-199e8y0"));

    			add_location(h20, file$4, 14, 2, 344);

    			attr_dev(h21, "class", h21_class_value = "" + (null_to_empty(`
        title title-empty 
        ${/*zoom*/ ctx[4] ? "zoom zoom-text" : ""} 
        ${/*center*/ ctx[1] ? "" : "no-center"}
      `) + " svelte-199e8y0"));

    			add_location(h21, file$4, 24, 2, 511);
    			attr_dev(div, "class", "unify svelte-199e8y0");

    			attr_dev(div, "style", div_style_value = `display: ${/*last*/ ctx[2] || /*index*/ ctx[3] <= 1
			? "flex"
			: "none"}`);

    			add_location(div, file$4, 13, 0, 263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h20);
    			append_dev(h20, t0);
    			append_dev(div, t1);
    			append_dev(div, h21);
    			append_dev(h21, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*zoom, center*/ 18 && h20_class_value !== (h20_class_value = "" + (null_to_empty(`
        title title-white
        ${/*zoom*/ ctx[4] ? "zoom zoom-text" : ""} 
        ${/*center*/ ctx[1] ? "" : "no-center opacity-0"}
      `) + " svelte-199e8y0"))) {
    				attr_dev(h20, "class", h20_class_value);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t2, /*title*/ ctx[0]);

    			if (dirty & /*zoom, center*/ 18 && h21_class_value !== (h21_class_value = "" + (null_to_empty(`
        title title-empty 
        ${/*zoom*/ ctx[4] ? "zoom zoom-text" : ""} 
        ${/*center*/ ctx[1] ? "" : "no-center"}
      `) + " svelte-199e8y0"))) {
    				attr_dev(h21, "class", h21_class_value);
    			}

    			if (dirty & /*last, index*/ 12 && div_style_value !== (div_style_value = `display: ${/*last*/ ctx[2] || /*index*/ ctx[3] <= 1
			? "flex"
			: "none"}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { title } = $$props;
    	let { center } = $$props;
    	let { last } = $$props;
    	let { index } = $$props;
    	let { zoom = false } = $$props;
    	const writable_props = ['title', 'center', 'last', 'index', 'zoom'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('last' in $$props) $$invalidate(2, last = $$props.last);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    		if ('zoom' in $$props) $$invalidate(4, zoom = $$props.zoom);
    	};

    	$$self.$capture_state = () => ({ title, center, last, index, zoom });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('last' in $$props) $$invalidate(2, last = $$props.last);
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    		if ('zoom' in $$props) $$invalidate(4, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, center, last, index, zoom];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			title: 0,
    			center: 1,
    			last: 2,
    			index: 3,
    			zoom: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Title> was created without expected prop 'title'");
    		}

    		if (/*center*/ ctx[1] === undefined && !('center' in props)) {
    			console.warn("<Title> was created without expected prop 'center'");
    		}

    		if (/*last*/ ctx[2] === undefined && !('last' in props)) {
    			console.warn("<Title> was created without expected prop 'last'");
    		}

    		if (/*index*/ ctx[3] === undefined && !('index' in props)) {
    			console.warn("<Title> was created without expected prop 'index'");
    		}
    	}

    	get title() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/components/Contact.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let title_1;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let form;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let textarea;
    	let t4;
    	let button;
    	let form_style_value;
    	let section_style_value;
    	let current;

    	title_1 = new Title({
    			props: {
    				title: /*title*/ ctx[2],
    				zoom: /*zoom*/ ctx[4],
    				center: /*center*/ ctx[3],
    				index: /*index*/ ctx[0],
    				last: /*last*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(title_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			form = element("form");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			textarea = element("textarea");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Enviar";
    			add_location(div0, file$3, 11, 4, 303);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "fname");
    			attr_dev(input0, "name", "fname");
    			attr_dev(input0, "placeholder", "First name");
    			attr_dev(input0, "class", "svelte-13jt4mc");
    			add_location(input0, file$3, 13, 6, 392);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "lname");
    			attr_dev(input1, "name", "lname");
    			attr_dev(input1, "placeholder", "E-mail");
    			attr_dev(input1, "class", "svelte-13jt4mc");
    			add_location(input1, file$3, 14, 6, 469);
    			attr_dev(textarea, "placeholder", "Type here...");
    			attr_dev(textarea, "class", "svelte-13jt4mc");
    			add_location(textarea, file$3, 15, 6, 542);
    			attr_dev(button, "class", "svelte-13jt4mc");
    			add_location(button, file$3, 16, 6, 588);
    			attr_dev(form, "style", form_style_value = `opacity: ${/*center*/ ctx[3] ? 1 : 0};`);
    			attr_dev(form, "action", "/action_page.php");
    			attr_dev(form, "class", "svelte-13jt4mc");
    			add_location(form, file$3, 12, 4, 315);
    			attr_dev(div1, "class", "cover svelte-13jt4mc");
    			add_location(div1, file$3, 10, 2, 279);
    			attr_dev(section, "style", section_style_value = `margin-top: ${/*last*/ ctx[1] ? "-48vh" : `${/*index*/ ctx[0] * 45}vh`};`);
    			attr_dev(section, "class", "svelte-13jt4mc");
    			add_location(section, file$3, 8, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(title_1, section, null);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			append_dev(form, t3);
    			append_dev(form, textarea);
    			append_dev(form, t4);
    			append_dev(form, button);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const title_1_changes = {};
    			if (dirty & /*title*/ 4) title_1_changes.title = /*title*/ ctx[2];
    			if (dirty & /*center*/ 8) title_1_changes.center = /*center*/ ctx[3];
    			if (dirty & /*index*/ 1) title_1_changes.index = /*index*/ ctx[0];
    			if (dirty & /*last*/ 2) title_1_changes.last = /*last*/ ctx[1];
    			title_1.$set(title_1_changes);

    			if (!current || dirty & /*center*/ 8 && form_style_value !== (form_style_value = `opacity: ${/*center*/ ctx[3] ? 1 : 0};`)) {
    				attr_dev(form, "style", form_style_value);
    			}

    			if (!current || dirty & /*last, index*/ 3 && section_style_value !== (section_style_value = `margin-top: ${/*last*/ ctx[1] ? "-48vh" : `${/*index*/ ctx[0] * 45}vh`};`)) {
    				attr_dev(section, "style", section_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	let { index } = $$props;
    	let { last } = $$props;
    	let { title } = $$props;
    	let { center } = $$props;
    	let zoom = false;
    	const writable_props = ['index', 'last', 'title', 'center'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('last' in $$props) $$invalidate(1, last = $$props.last);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('center' in $$props) $$invalidate(3, center = $$props.center);
    	};

    	$$self.$capture_state = () => ({ Title, index, last, title, center, zoom });

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(0, index = $$props.index);
    		if ('last' in $$props) $$invalidate(1, last = $$props.last);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('center' in $$props) $$invalidate(3, center = $$props.center);
    		if ('zoom' in $$props) $$invalidate(4, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, last, title, center, zoom];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { index: 0, last: 1, title: 2, center: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[0] === undefined && !('index' in props)) {
    			console.warn("<Contact> was created without expected prop 'index'");
    		}

    		if (/*last*/ ctx[1] === undefined && !('last' in props)) {
    			console.warn("<Contact> was created without expected prop 'last'");
    		}

    		if (/*title*/ ctx[2] === undefined && !('title' in props)) {
    			console.warn("<Contact> was created without expected prop 'title'");
    		}

    		if (/*center*/ ctx[3] === undefined && !('center' in props)) {
    			console.warn("<Contact> was created without expected prop 'center'");
    		}
    	}

    	get index() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.46.4 */

    const file$2 = "src/components/Header.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (27:4) {#each menus as menu}
    function create_each_block$1(ctx) {
    	let li;
    	let button;
    	let p;
    	let t0_value = /*menu*/ ctx[4].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*menu*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(p, file$2, 29, 10, 449);
    			attr_dev(button, "class", "svelte-1l6u373");
    			add_location(button, file$2, 28, 8, 390);
    			attr_dev(li, "class", "svelte-1l6u373");
    			add_location(li, file$2, 27, 6, 377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, p);
    			append_dev(p, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(27:4) {#each menus as menu}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let nav;
    	let ul;
    	let each_value = /*menus*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1l6u373");
    			add_location(ul, file$2, 25, 2, 340);
    			attr_dev(nav, "class", "svelte-1l6u373");
    			add_location(nav, file$2, 24, 0, 332);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*beforeGoTo, menus*/ 3) {
    				each_value = /*menus*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { goTo } = $$props;

    	let menus = [
    		{ name: "Home", index: 0 },
    		{ name: "Sobre", index: 1 },
    		{ name: "Portfolio", index: 2 },
    		{ name: "Contact", index: 5 }
    	];

    	function beforeGoTo(index) {
    		goTo(index);
    	}

    	const writable_props = ['goTo'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = menu => beforeGoTo(menu.index);

    	$$self.$$set = $$props => {
    		if ('goTo' in $$props) $$invalidate(2, goTo = $$props.goTo);
    	};

    	$$self.$capture_state = () => ({ goTo, menus, beforeGoTo });

    	$$self.$inject_state = $$props => {
    		if ('goTo' in $$props) $$invalidate(2, goTo = $$props.goTo);
    		if ('menus' in $$props) $$invalidate(0, menus = $$props.menus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menus, beforeGoTo, goTo, click_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { goTo: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*goTo*/ ctx[2] === undefined && !('goTo' in props)) {
    			console.warn("<Header> was created without expected prop 'goTo'");
    		}
    	}

    	get goTo() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goTo(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/components/Section.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let title_1;
    	let t;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let section_style_value;
    	let current;

    	title_1 = new Title({
    			props: {
    				title: /*title*/ ctx[0],
    				zoom: /*zoom*/ ctx[6],
    				center: /*center*/ ctx[3],
    				index: /*index*/ ctx[5],
    				last: /*last*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(title_1.$$.fragment);
    			t = space();
    			img = element("img");

    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(`
      ${/*zoom*/ ctx[6] ? "zoom zoom-image" : ""} 
      ${/*center*/ ctx[3] ? "not-skewed" : "skewed"}
    `) + " svelte-1rt2g9d"));

    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[2]);
    			add_location(img, file$1, 18, 2, 448);
    			attr_dev(section, "style", section_style_value = `margin-top: ${/*last*/ ctx[4] ? "-48vh" : `${/*index*/ ctx[5] * 45}vh`};`);
    			attr_dev(section, "class", "svelte-1rt2g9d");
    			add_location(section, file$1, 16, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(title_1, section, null);
    			append_dev(section, t);
    			append_dev(section, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const title_1_changes = {};
    			if (dirty & /*title*/ 1) title_1_changes.title = /*title*/ ctx[0];
    			if (dirty & /*center*/ 8) title_1_changes.center = /*center*/ ctx[3];
    			if (dirty & /*index*/ 32) title_1_changes.index = /*index*/ ctx[5];
    			if (dirty & /*last*/ 16) title_1_changes.last = /*last*/ ctx[4];
    			title_1.$set(title_1_changes);

    			if (!current || dirty & /*center*/ 8 && img_class_value !== (img_class_value = "" + (null_to_empty(`
      ${/*zoom*/ ctx[6] ? "zoom zoom-image" : ""} 
      ${/*center*/ ctx[3] ? "not-skewed" : "skewed"}
    `) + " svelte-1rt2g9d"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (!current || dirty & /*src*/ 2 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*alt*/ 4) {
    				attr_dev(img, "alt", /*alt*/ ctx[2]);
    			}

    			if (!current || dirty & /*last, index*/ 48 && section_style_value !== (section_style_value = `margin-top: ${/*last*/ ctx[4] ? "-48vh" : `${/*index*/ ctx[5] * 45}vh`};`)) {
    				attr_dev(section, "style", section_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, []);
    	let { title } = $$props;
    	let { src } = $$props;
    	let { alt } = $$props;
    	let { center } = $$props;
    	let { last } = $$props;
    	let { index } = $$props;
    	let zoom = false;
    	const writable_props = ['title', 'src', 'alt', 'center', 'last', 'index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('src' in $$props) $$invalidate(1, src = $$props.src);
    		if ('alt' in $$props) $$invalidate(2, alt = $$props.alt);
    		if ('center' in $$props) $$invalidate(3, center = $$props.center);
    		if ('last' in $$props) $$invalidate(4, last = $$props.last);
    		if ('index' in $$props) $$invalidate(5, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		Title,
    		title,
    		src,
    		alt,
    		center,
    		last,
    		index,
    		zoom
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('src' in $$props) $$invalidate(1, src = $$props.src);
    		if ('alt' in $$props) $$invalidate(2, alt = $$props.alt);
    		if ('center' in $$props) $$invalidate(3, center = $$props.center);
    		if ('last' in $$props) $$invalidate(4, last = $$props.last);
    		if ('index' in $$props) $$invalidate(5, index = $$props.index);
    		if ('zoom' in $$props) $$invalidate(6, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, src, alt, center, last, index, zoom];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			title: 0,
    			src: 1,
    			alt: 2,
    			center: 3,
    			last: 4,
    			index: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Section> was created without expected prop 'title'");
    		}

    		if (/*src*/ ctx[1] === undefined && !('src' in props)) {
    			console.warn("<Section> was created without expected prop 'src'");
    		}

    		if (/*alt*/ ctx[2] === undefined && !('alt' in props)) {
    			console.warn("<Section> was created without expected prop 'alt'");
    		}

    		if (/*center*/ ctx[3] === undefined && !('center' in props)) {
    			console.warn("<Section> was created without expected prop 'center'");
    		}

    		if (/*last*/ ctx[4] === undefined && !('last' in props)) {
    			console.warn("<Section> was created without expected prop 'last'");
    		}

    		if (/*index*/ ctx[5] === undefined && !('index' in props)) {
    			console.warn("<Section> was created without expected prop 'index'");
    		}
    	}

    	get title() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (162:6) {:else}
    function create_else_block(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				src: /*section*/ ctx[10].src,
    				alt: /*section*/ ctx[10].alt,
    				title: /*section*/ ctx[10].title,
    				center: /*section*/ ctx[10].index === 0,
    				last: /*section*/ ctx[10].index === -1,
    				index: /*section*/ ctx[10].index
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section_changes = {};
    			if (dirty & /*steps*/ 2) section_changes.src = /*section*/ ctx[10].src;
    			if (dirty & /*steps*/ 2) section_changes.alt = /*section*/ ctx[10].alt;
    			if (dirty & /*steps*/ 2) section_changes.title = /*section*/ ctx[10].title;
    			if (dirty & /*steps*/ 2) section_changes.center = /*section*/ ctx[10].index === 0;
    			if (dirty & /*steps*/ 2) section_changes.last = /*section*/ ctx[10].index === -1;
    			if (dirty & /*steps*/ 2) section_changes.index = /*section*/ ctx[10].index;
    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(162:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (154:6) {#if !!section.component}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*section*/ ctx[10].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				last: /*section*/ ctx[10].index === -1,
    				index: /*section*/ ctx[10].index,
    				title: /*section*/ ctx[10].title,
    				center: /*section*/ ctx[10].index === 0
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*steps*/ 2) switch_instance_changes.last = /*section*/ ctx[10].index === -1;
    			if (dirty & /*steps*/ 2) switch_instance_changes.index = /*section*/ ctx[10].index;
    			if (dirty & /*steps*/ 2) switch_instance_changes.title = /*section*/ ctx[10].title;
    			if (dirty & /*steps*/ 2) switch_instance_changes.center = /*section*/ ctx[10].index === 0;

    			if (switch_value !== (switch_value = /*section*/ ctx[10].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(154:6) {#if !!section.component}",
    		ctx
    	});

    	return block;
    }

    // (153:4) {#each steps as section}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!!/*section*/ ctx[10].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(153:4) {#each steps as section}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let p;
    	let t2_value = /*steps*/ ctx[1][/*currentStep*/ ctx[0]].stepTitle + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*steps*/ ctx[1][/*currentStep*/ ctx[0]].step + "";
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let t7;
    	let div4;
    	let t8;
    	let div5;
    	let current;

    	header = new Header({
    			props: { goTo: /*goTo*/ ctx[2] },
    			$$inline: true
    		});

    	let each_value = /*steps*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = text(" / 4");
    			t6 = space();
    			div3 = element("div");
    			t7 = space();
    			div4 = element("div");
    			t8 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "line svelte-1dkfiie");
    			add_location(div0, file, 141, 4, 3882);
    			attr_dev(p, "class", "title svelte-1dkfiie");
    			add_location(p, file, 142, 4, 3907);
    			attr_dev(div1, "class", "indicator svelte-1dkfiie");
    			add_location(div1, file, 140, 2, 3854);
    			attr_dev(div2, "class", "step svelte-1dkfiie");
    			add_location(div2, file, 146, 2, 3982);
    			attr_dev(div3, "class", "object svelte-1dkfiie");
    			add_location(div3, file, 149, 2, 4046);
    			attr_dev(div4, "class", "cursor svelte-1dkfiie");
    			add_location(div4, file, 150, 2, 4071);
    			attr_dev(div5, "class", "sections svelte-1dkfiie");
    			add_location(div5, file, 151, 2, 4096);
    			attr_dev(main, "class", "svelte-1dkfiie");
    			add_location(main, file, 138, 0, 3825);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(main, t6);
    			append_dev(main, div3);
    			append_dev(main, t7);
    			append_dev(main, div4);
    			append_dev(main, t8);
    			append_dev(main, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*steps, currentStep*/ 3) && t2_value !== (t2_value = /*steps*/ ctx[1][/*currentStep*/ ctx[0]].stepTitle + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*steps, currentStep*/ 3) && t4_value !== (t4_value = /*steps*/ ctx[1][/*currentStep*/ ctx[0]].step + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*steps*/ 2) {
    				each_value = /*steps*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function debounce(func, wait, immediate = false) {
    	let timeout;

    	return function (...t) {
    		const context = this, d = immediate && !timeout;

    		(clearTimeout(timeout), timeout = setTimeout(
    			function () {
    				(timeout = null, immediate || func.apply(context, t));
    			},
    			wait
    		), d && func.apply(context, t));
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const STEPS = [
    		{
    			step: 1,
    			stepTitle: "Bem vindo!",
    			src: "images/image1.webp",
    			alt: "imagem",
    			title: "Henrique Ramos, Web Developer",
    			index: 0
    		},
    		{
    			step: 2,
    			stepTitle: "Quem sou eu?",
    			src: "images/image1.webp",
    			alt: "imagem",
    			title: "Teste do Web Developer",
    			index: 1
    		},
    		{
    			step: 3,
    			stepTitle: "Trabalhos",
    			src: "images/image1.webp",
    			alt: "imagem",
    			title: "Uma nova seção",
    			index: 2
    		},
    		{
    			step: 3,
    			stepTitle: "Trabalhos",
    			src: "images/image1.webp",
    			alt: "imagem",
    			title: "Penultima seção",
    			index: 3
    		},
    		{
    			step: 3,
    			stepTitle: "Trabalhos",
    			src: "images/image1.webp",
    			alt: "imagem",
    			title: "Ultima seção",
    			index: 4
    		},
    		{
    			step: 4,
    			stepTitle: "Contact",
    			title: "Contact",
    			index: 5,
    			component: Contact
    		}
    	];

    	var mouse_x;
    	var mouse_y;
    	let currentStep = 0;

    	function moveSections(direction) {
    		// Direction = -1 === Up
    		// Direction = 1 === Down
    		if (currentStep + direction < 0) {
    			return;
    		} else if (currentStep + direction > steps.length - 1) {
    			return;
    		} else {
    			$$invalidate(0, currentStep = currentStep + direction);
    		}

    		if (direction === 1) {
    			$$invalidate(1, steps = [
    				...steps.map(step => Object.assign(Object.assign({}, step), { index: step.index - 1 }))
    			]);
    		} else {
    			$$invalidate(1, steps = [
    				...steps.map(step => Object.assign(Object.assign({}, step), { index: step.index + 1 }))
    			]);
    		}
    	}

    	function mouseWheel(e) {
    		var direction = e.deltaY > 0 ? 1 : -1;
    		moveSections(direction);
    	}

    	function verify(e) {
    		var wheelDeltaY = e.wheelDeltaY;

    		if (!wheelDeltaY) {
    			var new_mouse_y = e.changedTouches[0].pageY || e.pageY;

    			if (new_mouse_y - mouse_y > 75) {
    				wheelDeltaY = -1;
    			} else if (new_mouse_y - mouse_y < -75) {
    				wheelDeltaY = 1;
    			}

    			moveSections(wheelDeltaY);
    		}
    	}

    	function get_mouse_coords(e) {
    		mouse_x = e.pageX;
    		mouse_y = e.changedTouches[0].pageY || e.pageY;
    	}

    	window.addEventListener("touchstart", get_mouse_coords, false);
    	window.addEventListener("touchmove", debounce(e => verify(e), 500));

    	window.addEventListener("mousemove", e => {
    		if (window.innerWidth < 640) {
    			return;
    		}

    		var obg = document.querySelector(".object");
    		var cur = document.querySelector(".cursor");
    		cur.style.left = e.pageX + "px";
    		cur.style.top = e.pageY + "px";

    		setTimeout(
    			() => {
    				obg.style.left = e.pageX + "px";
    				obg.style.top = e.pageY + "px";
    			},
    			50
    		);
    	});

    	window.addEventListener("mousewheel", debounce(e => mouseWheel(e), 300));

    	window.addEventListener("keydown", e => {
    		e.key === "ArrowDown" && debounce(() => moveSections(1), 300)();
    		e.key === "ArrowUp" && debounce(() => moveSections(-1), 300)();
    	});

    	let steps = STEPS;

    	function goTo(index) {
    		console.log("New index: ", index);
    		$$invalidate(0, currentStep = index);
    		$$invalidate(1, steps = STEPS.map(step => Object.assign(Object.assign({}, step), { index: step.index - index })));
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Contact,
    		Header,
    		Section,
    		STEPS,
    		mouse_x,
    		mouse_y,
    		currentStep,
    		debounce,
    		moveSections,
    		mouseWheel,
    		verify,
    		get_mouse_coords,
    		steps,
    		goTo
    	});

    	$$self.$inject_state = $$props => {
    		if ('mouse_x' in $$props) mouse_x = $$props.mouse_x;
    		if ('mouse_y' in $$props) mouse_y = $$props.mouse_y;
    		if ('currentStep' in $$props) $$invalidate(0, currentStep = $$props.currentStep);
    		if ('steps' in $$props) $$invalidate(1, steps = $$props.steps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentStep, steps, goTo];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
