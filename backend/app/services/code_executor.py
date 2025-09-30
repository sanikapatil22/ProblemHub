import subprocess
import tempfile
import os
import time
from typing import Dict, Tuple
from app.models.submission import ProgrammingLanguage

class CodeExecutor:
    def __init__(self, time_limit: int = 2, memory_limit: int = 256):
        self.time_limit = time_limit
        self.memory_limit = memory_limit
    
    def execute(
        self,
        code: str,
        language: ProgrammingLanguage,
        test_input: str
    ) -> Tuple[str, str, float, bool]:
        """
        Execute code and return (stdout, stderr, execution_time, success)
        """
        if language == ProgrammingLanguage.PYTHON:
            return self._execute_python(code, test_input)
        elif language == ProgrammingLanguage.JAVASCRIPT:
            return self._execute_javascript(code, test_input)
        # Add more languages as needed
        else:
            return "", "Language not supported", 0, False
    
    def _execute_python(self, code: str, test_input: str) -> Tuple[str, str, float, bool]:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            start_time = time.time()
            process = subprocess.Popen(
                ['python', temp_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(
                    input=test_input,
                    timeout=self.time_limit
                )
                execution_time = time.time() - start_time
                success = process.returncode == 0
                
                return stdout.strip(), stderr.strip(), execution_time, success
            
            except subprocess.TimeoutExpired:
                process.kill()
                return "", "Time Limit Exceeded", self.time_limit, False
        
        finally:
            os.unlink(temp_file)
    
    def _execute_javascript(self, code: str, test_input: str) -> Tuple[str, str, float, bool]:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            # Wrap code to read from stdin
            wrapped_code = f"""
const readline = require('readline');
const rl = readline.createInterface({{
    input: process.stdin,
    output: process.stdout
}});

let input = [];
rl.on('line', (line) => {{
    input.push(line);
}});

rl.on('close', () => {{
    {code}
}});
"""
            f.write(wrapped_code)
            temp_file = f.name
        
        try:
            start_time = time.time()
            process = subprocess.Popen(
                ['node', temp_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(
                    input=test_input,
                    timeout=self.time_limit
                )
                execution_time = time.time() - start_time
                success = process.returncode == 0
                
                return stdout.strip(), stderr.strip(), execution_time, success
            
            except subprocess.TimeoutExpired:
                process.kill()
                return "", "Time Limit Exceeded", self.time_limit, False
        
        finally:
            os.unlink(temp_file)