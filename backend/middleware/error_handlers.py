import uuid
from flask import jsonify
from werkzeug.exceptions import HTTPException
from utils.logger import logger

def register_error_handlers(app):
    """Registers application-wide JSON error handlers on the Flask app instance."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'BAD_REQUEST',
            'message': getattr(error, 'description', 'Invalid request format or missing data.')
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'NOT_FOUND',
            'message': 'The requested resource or endpoint was not found.'
        }), 404

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            'success': False,
            'error': 'UNPROCESSABLE_ENTITY',
            'message': getattr(error, 'description', 'Request payload could not be processed due to validation errors.')
        }), 422

    @app.errorhandler(Exception)
    def handle_exception(e):
        # If it's a standard Werkzeug HTTP exception, return its own code and message
        if isinstance(e, HTTPException):
            return jsonify({
                'success': False,
                'error': e.name.upper().replace(' ', '_'),
                'message': e.description
            }), e.code

        # Generate a unique short trace ID for log tracking
        trace_id = uuid.uuid4().hex[:8]
        logger.exception(f"Unhandled Exception [Trace ID: {trace_id}]")

        return jsonify({
            'success': False,
            'error': 'INTERNAL_SERVER_ERROR',
            'message': 'An unexpected server error occurred. Please contact administrator.',
            'trace_id': trace_id
        }), 500
