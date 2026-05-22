import os
from pathlib import Path

# Directory where custom tool scripts are stored
TOOLS_DIR = Path(__file__).parent / "custom_tools"
TOOLS_DIR.mkdir(exist_ok=True)

# In-memory registry mapping tool name to callable
custom_tools = {}

def _validate_name(name: str) -> None:
    """Validate that the tool name is a valid Python identifier and does not contain malicious paths."""
    if not name.isidentifier():
        raise ValueError(f"Invalid tool name '{name}'. Must be a valid Python identifier.")
    if ".." in name or "/" in name or "\\" in name:
        raise ValueError("Tool name cannot contain path traversal characters.")

def _tool_file_path(name: str) -> Path:
    """Return the file path for a given tool name."""
    return TOOLS_DIR / f"{name}.py"

def register_tool(name: str, code: str) -> None:
    """Register a custom tool.
    The tool code should define a callable with the same name as `name`.
    The code is saved to the custom tools directory and loaded into the in‑memory registry.
    """
    _validate_name(name)
    file_path = _tool_file_path(name)
    # Write the code to the file (overwrites existing definitions)
    file_path.write_text(code, encoding="utf-8")
    # Load the function from the file safely using exec in an isolated namespace
    local_ns: dict = {}
    exec(code, {}, local_ns)
    func = local_ns.get(name)
    if not callable(func):
        raise ValueError(f"The provided code does not define a callable named '{name}'.")
    custom_tools[name] = func

def get_tool(name: str):
    """Retrieve a registered custom tool function by name, or None if not registered."""
    return custom_tools.get(name)

def list_tools() -> list[str]:
    """Return a sorted list of registered custom tool names."""
    return sorted(custom_tools.keys())
