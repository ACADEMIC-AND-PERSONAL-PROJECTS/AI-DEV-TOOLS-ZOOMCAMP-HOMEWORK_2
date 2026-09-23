package com.techblocks.common;

import org.springframework.context.MessageSourceResolvable;
import org.springframework.core.Ordered;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.List;
import java.util.Objects;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RestExceptionHandler {

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ProblemDetail handleValidation(HandlerMethodValidationException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation échouée");
        List<String> errors = exception.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream())
                .map(RestExceptionHandler::formatError)
                .filter(Objects::nonNull)
                .toList();
        problemDetail.setProperty("errors", errors);
        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleBeanValidation(MethodArgumentNotValidException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation échouée");
        List<String> errors = exception.getBindingResult().getFieldErrors().stream()
                .map(RestExceptionHandler::formatError)
                .filter(Objects::nonNull)
                .toList();
        problemDetail.setProperty("errors", errors);
        return problemDetail;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleConflict(DataIntegrityViolationException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Conflit de données");
    }

    private static String formatError(MessageSourceResolvable error) {
        String message = error.getDefaultMessage();
        if (message == null) {
            return null;
        }
        if (error instanceof FieldError fieldError) {
            return fieldError.getField() + ": " + message;
        }
        return message;
    }
}
