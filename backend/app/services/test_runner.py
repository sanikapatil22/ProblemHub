from typing import List, Dict, Tuple
from app.services.code_executor import CodeExecutor
from app.models.submission import ProgrammingLanguage, SubmissionStatus

class TestRunner:
    def __init__(self, time_limit: int = 2, memory_limit: int = 256):
        self.executor = CodeExecutor(time_limit, memory_limit)
    
    def run_tests(
        self,
        code: str,
        language: ProgrammingLanguage,
        test_cases: List[Dict]
    ) -> Tuple[SubmissionStatus, int, int, float, str]:
        """
        Run all test cases and return (status, passed, total, time, error_msg)
        """
        total_tests = len(test_cases)
        passed_tests = 0
        total_time = 0.0
        error_message = ""
        
        for i, test_case in enumerate(test_cases):
            test_input = test_case["input"]
            expected_output = test_case["output"].strip()
            
            stdout, stderr, exec_time, success = self.executor.execute(
                code, language, test_input
            )
            
            total_time += exec_time
            
            if not success:
                if "Time Limit Exceeded" in stderr:
                    return (
                        SubmissionStatus.TIME_LIMIT_EXCEEDED,
                        passed_tests,
                        total_tests,
                        total_time,
                        f"Time limit exceeded on test case {i + 1}"
                    )
                else:
                    return (
                        SubmissionStatus.RUNTIME_ERROR,
                        passed_tests,
                        total_tests,
                        total_time,
                        f"Runtime error on test case {i + 1}: {stderr}"
                    )
            
            # Compare output
            actual_output = stdout.strip()
            if actual_output == expected_output:
                passed_tests += 1
            else:
                return (
                    SubmissionStatus.WRONG_ANSWER,
                    passed_tests,
                    total_tests,
                    total_time,
                    f"Wrong answer on test case {i + 1}"
                )
        
        return (
            SubmissionStatus.ACCEPTED,
            passed_tests,
            total_tests,
            total_time,
            "All test cases passed"
        )