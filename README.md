jSelect
=======

A nice UI for select dropdowns which generally just suck and can't be styled. jSelect creates new markup for you and still has the same behaviour of the normal select element regarding mouse and keyboard interactions.

### HTML Markup

```
<select name="fruits" id="fruits">
    <option value="Apple">Apple</option>
    <option value="Banana">Banana</option>
    <option value="Melon">Melon</option>
    <option value="Pear">Pear</option>
    <option value="Grapes">Grapes</option>
</select>
```

### JavaScript Initialisation

```
$('select').jSelect(); // Without custom options 

$('select').jSelect({ // With custom options 
    placeholder: 'Please select a fruit', 
    size: 3, 
    value: 'Apple' 
});
```

### Plugin Options

The plugin comes with a few options that can be customised to produce the desired behaviour. Some of these include disabling the dropdown or keyboard input as well specifying the placeholder text or starting value. A full list of each option and what they do can be found below:

#### id

`Default: ''`

The `id` of the jSelect element created, this can be specified as an option or if not specified it will use the `HTML id attribute` if there is one. If neither of these are present it will create a unique id.

#### placeholder

`Default: 'Please select an option'`

Most form elements have a placeholder and jSelect is no exception. Doing it with normal select elements sucks, this allows it in a much easier way.

#### value

`Default: ''`

If you want to initialise the plugin with a pre-selected value.

#### size

`Default: 0`

The number of options visible without scrolling. Default is 0 which means show everything.

#### keyBoardInput

`Default: true`

Allow the jSelect element to be used via the arrow keys and enter key. Can make selection much easier. This also allows typing to find an option.

#### disabled

`Default: false`

Disable the jSelect element so nothing can be selected.

#### onChange

`Default: function(value) { }`

A callback that occurs when an option has been selected, the argument is the selected value. You have access to `this` inside this function.
