#!/usr/bin/env python3
"""
Browser-use Python Bridge for UI Agent Benchmark

This script acts as a bridge between the TypeScript Agent framework and the Python browser-use library.
It receives JSON input via stdin and outputs JSON results via stdout.
"""

import asyncio
import json
import sys
import os
import traceback
from typing import Any, Dict, List, Optional

# Load environment variables from input
def setup_environment(env_vars: Dict[str, str]):
    """Set up environment variables for browser-use."""
    for key, value in env_vars.items():
        if value:
            os.environ[key] = value

async def run_browser_use_task(
    url: str,
    prompt: str,
    timeout_ms: int,
    use_vision: bool = True,
    max_steps: int = 100,
) -> Dict[str, Any]:
    """
    Execute a browser-use task and return the results.

    Args:
        url: The target URL to test
        prompt: The test instruction/prompt
        timeout_ms: Timeout in milliseconds
        use_vision: Whether to use vision capabilities
        max_steps: Maximum number of steps the agent can take

    Returns:
        Dictionary containing the execution results
    """
    try:
        from browser_use import Agent, Browser, ChatOpenAI
    
    except ImportError as e:
        return {
            "has_defect": True,
            "defects": [{
                "type": "other",
                "description": f"Failed to import browser-use: {str(e)}. Please install with: pip install browser-use langchain-openai",
                "severity": "high"
            }],
            "raw_output": {"error": str(e), "import_error": True},
            "errors": [{"message": str(e), "stack": traceback.format_exc()}]
        }

    errors: List[Dict[str, str]] = []
    has_defect = False
    raw_output: Dict[str, Any] = {}
    agent_judgment = ""
    execution_status = "success"

    try:
        # Configure LLM
        model_name = os.getenv("OPENAI_MODEL")
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL")

        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        llm_config = {
            "model": model_name,
            "api_key": api_key,
        }
        if base_url:
            llm_config["base_url"] = base_url

        print(f"[BrowserUse] LLM Config: {llm_config}", file=sys.stderr)

        llm = ChatOpenAI(**llm_config)

        # Create browser with config
        browser = Browser(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )

        # Build task with URL navigation
        full_task = f"Navigate to {url} and then: {prompt}"

        # Create agent with the task
        agent = Agent(
            task=full_task,
            llm=llm,
            browser=browser,
            use_vision=use_vision,
        )

        print(f"[BrowserUse] Target URL: {url}", file=sys.stderr)
        print(f"[BrowserUse] Executing task: {full_task}", file=sys.stderr)

        # Run the agent
        timeout_sec = timeout_ms / 1000
        history = await asyncio.wait_for(
            agent.run(max_steps=max_steps),
            timeout=timeout_sec
        )

        # print history for debugging
        print(f"[BrowserUse] Agent history: {history}", file=sys.stderr)

        # Analyze results using AgentHistoryList methods
        try:
            # Call methods to get data
            is_successful = history.is_successful() if callable(history.is_successful) else history.is_successful
            total_steps = history.number_of_steps() if callable(history.number_of_steps) else history.number_of_steps
            urls_visited = history.urls() if callable(history.urls) else (history.urls if hasattr(history, 'urls') else [])
            action_names_list = history.action_names() if callable(history.action_names) else (history.action_names if hasattr(history, 'action_names') else [])
            errors_list = history.errors() if callable(history.errors) else (history.errors if hasattr(history, 'errors') else [])
            
            # Get final result
            final_result = None
            try:
                final_result = history.final_result() if callable(history.final_result) else history.final_result
            except:
                pass
            
            print(f"[BrowserUse] Task completed. Success: {is_successful}, Steps: {total_steps}", file=sys.stderr)
            print(f"[BrowserUse] URLs visited: {urls_visited}", file=sys.stderr)
            print(f"[BrowserUse] Actions: {action_names_list}", file=sys.stderr)
            print(f"[BrowserUse] Errors: {errors_list}", file=sys.stderr)
            
            has_defect = not is_successful
            
            # Build action results
            action_results = []
            for i in range(total_steps):
                action_data = {
                    "step": i + 1,
                    "action": action_names_list[i] if i < len(action_names_list) else None,
                    "error": errors_list[i] if i < len(errors_list) else None,
                }
                action_results.append(action_data)
                
        except Exception as e:
            print(f"[BrowserUse] Error parsing history: {e}", file=sys.stderr)
            print(f"[BrowserUse] History object: {history}", file=sys.stderr)
            is_successful = False
            has_defect = True
            total_steps = 0
            urls_visited = []
            action_results = []
            final_result = None

        raw_output = {
            "agent": "browser-use",
            "access_url": url,
            "prompt": prompt,
            "status": "success" if is_successful else "failed",
            "is_successful": is_successful,
            "total_steps": total_steps,
            "urls_visited": urls_visited,
            "action_results": action_results,
            "final_result": final_result,
        }

        # Build agent judgment string for LLM evaluation
        error_count = len([e for e in errors_list if e]) if 'errors_list' in locals() else 0
        
        if is_successful:
            agent_judgment = f"Task completed successfully in {total_steps} steps."
            if final_result:
                agent_judgment += f" Final result: {final_result}"
        else:
            agent_judgment = f"Task did not complete successfully after {total_steps} steps."
            if error_count > 0:
                agent_judgment += f" Found {error_count} errors during execution."
                # Include first few errors
                if 'errors_list' in locals() and errors_list:
                    error_msgs = [str(e) for e in errors_list if e][:3]
                    if error_msgs:
                        agent_judgment += " Errors: " + "; ".join(error_msgs)

    except asyncio.TimeoutError:
        error_msg = f"Task timed out after {timeout_ms}ms"
        print(f"[BrowserUse] {error_msg}", file=sys.stderr)
        has_defect = True
        execution_status = "timeout"
        errors.append({"message": error_msg})
        raw_output = {
            "agent": "browser-use",
            "access_url": url,
            "prompt": prompt,
            "status": "timeout",
            "error": error_msg,
        }

    except Exception as e:
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        print(f"[BrowserUse] Error: {error_msg}", file=sys.stderr)
        has_defect = True
        execution_status = "error"
        errors.append({"message": error_msg, "stack": stack_trace})
        raw_output = {
            "agent": "browser-use",
            "access_url": url,
            "prompt": prompt,
            "status": "error",
            "error": error_msg,
            "stack_trace": stack_trace,
        }

    finally:
        # Ensure browser is closed
        try:
            if 'browser' in locals() and browser is not None:
                # Browser-use Browser object doesn't have close() method
                # The browser context is managed by the library
                pass
        except Exception as e:
            print(f"[BrowserUse] Error closing browser: {e}", file=sys.stderr)

    # Build defects list
    defects = []
    if has_defect:
        defect_description = agent_judgment if agent_judgment else "Browser-use detected task failure"
        defects.append({
            "type": "interaction",
            "description": defect_description,
            "severity": "medium",
        })

    return {
        "has_defect": has_defect,
        "defects": defects,
        "raw_output": raw_output,
        "errors": errors,
        "agent_judgment": agent_judgment,
        "execution_status": execution_status,
    }

def main():
    """Main entry point - reads JSON from stdin and outputs JSON to stdout."""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)

        # Extract parameters
        url = input_data.get("url")
        prompt = input_data.get("prompt")
        timeout = input_data.get("timeout", 60000)  # Default 60s
        env = input_data.get("env", {})
        use_vision = input_data.get("use_vision", True)
        max_steps = input_data.get("max_steps", 100)

        if not url or not prompt:
            result = {
                "has_defect": True,
                "defects": [{
                    "type": "other",
                    "description": "Missing required parameters: 'url' and 'prompt' are required",
                    "severity": "high"
                }],
                "raw_output": {"error": "Missing required parameters"},
                "errors": [{"message": "Missing required parameters: 'url' and 'prompt'"}]
            }
            print(json.dumps(result))
            return

        # Set up environment variables
        setup_environment(env)

        # Run the task
        result = asyncio.run(run_browser_use_task(
            url=url,
            prompt=prompt,
            timeout_ms=timeout,
            use_vision=use_vision,
            max_steps=max_steps,
        ))

        # Output result as JSON
        print(json.dumps(result))

    except json.JSONDecodeError as e:
        error_result = {
            "has_defect": True,
            "defects": [{
                "type": "other",
                "description": f"Invalid JSON input: {str(e)}",
                "severity": "high"
            }],
            "raw_output": {"error": str(e), "parse_error": True},
            "errors": [{"message": f"Invalid JSON input: {str(e)}"}]
        }
        print(json.dumps(error_result))

    except Exception as e:
        error_result = {
            "has_defect": True,
            "defects": [{
                "type": "other",
                "description": f"Unexpected error: {str(e)}",
                "severity": "high"
            }],
            "raw_output": {"error": str(e)},
            "errors": [{"message": str(e), "stack": traceback.format_exc()}]
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
